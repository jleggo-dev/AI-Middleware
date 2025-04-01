/**
 * File Content API Route
 * 
 * GET: Retrieves the content of a file from S3, with special handling for CSV and text files
 * - Validates user authentication and file access
 * - For CSV files: Returns headers and first row, formatted for MessageConstructor
 * - For text files: Returns first two lines as a pre-selected single column, formatted for MessageConstructor
 * - For malformed CSV files: Falls back to text file handling with a warning
 * - Limits content retrieval to optimize loading speed
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { 
  S3Client, 
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { parse } from 'csv-parse/sync'; // Use sync version for simpler implementation
import { Readable } from 'stream';

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.AWS_S3_BUCKET || 'ai-mw-file-storage';

/**
 * Processes a CSV file stream and returns headers and first row
 * Formats data for direct use with the MessageConstructor component
 */
async function processCSVContent(stream: Readable): Promise<{
  isValid: boolean;
  columns?: Array<{ id: string; name: string; selected: boolean }>;
  firstRow?: Record<string, string>;
  error?: string;
}> {
  try {
    // Read the stream into a buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const content = buffer.toString('utf-8');

    // Parse CSV content synchronously
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as Record<string, string>[];

    // If no records, treat as invalid CSV
    if (!records || records.length === 0) {
      return {
        isValid: false,
        error: 'CSV file is empty or has no valid records'
      };
    }

    // Get headers from first record
    const headers = Object.keys(records[0]);
    
    // Create columns array for MessageConstructor
    const columns = headers.map((header, index) => ({
      id: `col-${index}`,
      name: header,
      selected: false,
    }));

    // Get first row of data
    const firstRow = records[0];

    return {
      isValid: true,
      columns,
      firstRow,
    };
  } catch (e) {
    console.error('Error processing CSV content:', e);
    return {
      isValid: false,
      error: 'Failed to parse CSV file. File may be malformed.'
    };
  }
}

/**
 * Processes a text file stream and returns first two lines
 * Limits retrieval to optimize performance for message construction preview
 */
async function processTextContent(stream: Readable): Promise<{
  content: string;
  error?: string;
}> {
  try {
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const content = buffer.toString('utf-8');
    
    // Split by newline and get first two lines
    const lines = content.split('\n').slice(0, 2);
    return {
      content: lines.join('\n')
    };
  } catch (e) {
    console.error('Error processing text content:', e);
    return {
      content: '',
      error: 'Failed to read text file content'
    };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    // Create Supabase client using the new format for Next.js 15
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get file metadata from Supabase
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', params.fileId)
      .single();

    if (fileError || !file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Verify file ownership
    if (file.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Get file from S3
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: file.s3_key
    });

    const response = await s3Client.send(getCommand);
    
    if (!response.Body) {
      return NextResponse.json(
        { error: 'File content not available' },
        { status: 404 }
      );
    }

    // Process based on file type
    const isCSV = file.original_name.toLowerCase().endsWith('.csv');
    
    if (isCSV) {
      const result = await processCSVContent(response.Body as Readable);
      
      if (!result.isValid) {
        // Return error but also treat as text file
        const textResult = await processTextContent(response.Body as Readable);
        
        // Create a single column for the text content
        const columnName = `${file.original_name} content`;
        return NextResponse.json({
          type: 'text',
          warning: result.error,
          columns: [
            {
              id: 'content-column',
              name: columnName,
              selected: true, // Pre-select the column
            }
          ],
          firstRow: {
            [columnName]: textResult.content
          }
        });
      }

      return NextResponse.json({
        type: 'csv',
        columns: result.columns,
        firstRow: result.firstRow
      });
    } else {
      // Process as text file
      const result = await processTextContent(response.Body as Readable);
      
      if (result.error) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      // Create a single column for the text content
      const columnName = `${file.original_name} content`;
      return NextResponse.json({
        type: 'text',
        columns: [
          {
            id: 'content-column',
            name: columnName,
            selected: true, // Pre-select the column
          }
        ],
        firstRow: {
          [columnName]: result.content
        }
      });
    }

  } catch (error) {
    console.error('Error retrieving file content:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve file content' },
      { status: 500 }
    );
  }
} 
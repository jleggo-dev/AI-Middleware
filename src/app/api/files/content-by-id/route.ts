import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { parse } from 'csv-parse/sync';
import { Readable } from 'stream';

// S3 client initialization
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.AWS_S3_BUCKET || 'ai-mw-file-storage';

/**
 * Process CSV content to extract headers and first row
 */
async function processCSV(stream: Readable) {
  try {
    // Read stream into buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const content = buffer.toString('utf-8');

    // Parse CSV
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as Record<string, string>[];

    if (!records || records.length === 0) {
      return { isValid: false, error: 'CSV file is empty or has no valid records' };
    }

    // Extract headers and first row
    const headers = Object.keys(records[0]);
    const columns = headers.map((header, index) => ({
      id: `col-${index}`,
      name: header,
      selected: false,
    }));

    return {
      isValid: true,
      columns,
      firstRow: records[0],
    };
  } catch (e) {
    console.error('Error processing CSV:', e);
    return { isValid: false, error: 'Failed to parse CSV file' };
  }
}

/**
 * Process text content to extract first two lines
 */
async function processText(stream: Readable) {
  try {
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const content = buffer.toString('utf-8');
    
    // Get first two lines
    const lines = content.split('\n').slice(0, 2);
    return { content: lines.join('\n') };
  } catch (e) {
    console.error('Error processing text:', e);
    return { content: '', error: 'Failed to read text file content' };
  }
}

// Uses query parameter instead of path parameter
export async function GET(request: Request) {
  try {
    // Get fileId from URL query parameter
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    
    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }
    
    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get file metadata
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Verify file ownership
    if (file.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Get file from S3
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: file.s3_key
    });

    const response = await s3Client.send(getCommand);
    
    if (!response.Body) {
      return NextResponse.json({ error: 'File content not available' }, { status: 404 });
    }

    // Process based on file type
    const isCSV = file.original_name.toLowerCase().endsWith('.csv');
    
    if (isCSV) {
      const result = await processCSV(response.Body as Readable);
      
      if (!result.isValid) {
        // Fall back to text processing for malformed CSV
        const textResult = await processText(response.Body as Readable);
        
        // Create a single column for the text content
        const columnName = `${file.original_name} content`;
        return NextResponse.json({
          success: true,
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
        success: true,
        type: 'csv',
        columns: result.columns,
        firstRow: result.firstRow
      });
    } else {
      // Process as text file
      const result = await processText(response.Body as Readable);
      
      if (result.error) {
        return NextResponse.json({ 
          success: false,
          error: result.error 
        }, { status: 500 });
      }

      // Create a single column for the text content
      const columnName = `${file.original_name} content`;
      return NextResponse.json({
        success: true,
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
      { 
        success: false,
        error: 'Failed to retrieve file content',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
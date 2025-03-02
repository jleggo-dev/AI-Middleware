/**
 * Upload URL API Route
 * 
 * POST: Generates a pre-signed URL for direct upload to S3 and records file metadata in Supabase
 * 
 * This endpoint:
 * 1. Creates a pre-signed URL for direct S3 upload
 * 2. Records the file metadata in Supabase files table
 * 3. Returns the URL and file information to the client
 */

import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import crypto from 'crypto';
import path from 'path';

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// The bucket name from environment variables
const bucketName = process.env.AWS_S3_BUCKET || 'ai-mw-file-storage';

// Allowed prefixes based on IAM policy
const ALLOWED_PREFIXES = ['uploads/', 'processed/'];

/**
 * Creates a safe filename for upload by removing special characters
 * and adding a timestamp and random ID
 */
function createSafeFilename(originalName: string): string {
  // Get file extension
  const ext = path.extname(originalName);
  // Get filename without extension and remove special characters
  const basename = path.basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  
  // Add timestamp and random id for uniqueness
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(4).toString('hex');
  
  return `${basename}-${timestamp}-${randomId}${ext}`;
}

/**
 * POST /api/files/upload-url
 * Generates a pre-signed URL for direct file upload to S3
 */
export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client using cookies for authentication
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Check if the user is authenticated
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }
    
    // Get the user ID from the session
    const userId = session.user.id;
    
    // Get request body
    const body = await request.json();
    const { filename, contentType, prefix = 'uploads/' } = body;
    
    if (!filename || !contentType) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'Filename and content type are required' 
        },
        { status: 400 }
      );
    }
    
    // Create a safe filename
    const safeFilename = createSafeFilename(filename);
    
    // Ensure the prefix ends with a slash
    const sanitizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;
    
    // Create the full key (path) in S3
    const key = `${sanitizedPrefix}${userId}/${safeFilename}`;
    
    // Validate the key is within allowed prefixes
    if (!ALLOWED_PREFIXES.some(p => key.startsWith(p))) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid prefix',
          message: `Prefix must be one of: ${ALLOWED_PREFIXES.join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // Create the put command
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
      // Add metadata to track the upload
      Metadata: {
        'original-filename': filename,
        'uploaded-by': userId,
      }
    });
    
    // Generate pre-signed URL (valid for 15 minutes)
    const signedUrl = await getSignedUrl(s3Client, putCommand, { 
      expiresIn: 15 * 60 // 15 minutes
    });

    // Insert file metadata into Supabase
    const { data: fileData, error: insertError } = await supabase
      .from('files')
      .insert({
        user_id: userId,
        s3_key: key,
        original_name: filename,
        status: 'uploading' // Initial status before the client completes the upload
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting file metadata:', insertError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to record file metadata',
          message: insertError.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      url: signedUrl,
      key,
      bucket: bucketName,
      expiresIn: 15 * 60, // 15 minutes in seconds
      fileId: fileData.id, // Return the Supabase file ID
      metadata: {
        filename,
        contentType,
      }
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate upload URL',
        message: (error as Error).message 
      },
      { status: 500 }
    );
  }
} 
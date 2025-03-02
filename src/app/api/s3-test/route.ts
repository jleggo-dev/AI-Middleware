/**
 * S3 Testing API Route
 * 
 * This route tests the connection to AWS S3 and performs basic operations
 * allowed by the IAM policy:
 * - PutObject: Upload a test file to the uploads/ path
 * - GetObject: Retrieve the uploaded file 
 * - Generate a pre-signed URL for the object
 * - DeleteObject: Remove the test file
 * 
 * The IAM policy restricts operations to only these actions on paths:
 * - uploads/*
 * - processed/*
 */

import { NextResponse } from 'next/server';
import { 
  S3Client, 
  PutObjectCommand,
  GetObjectCommand, 
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

export async function GET() {
  // Create a test file path in the allowed 'uploads/' directory
  const testKey = `uploads/test-file-${Date.now()}.txt`;
  const testContent = `This is a test file created at ${new Date().toISOString()}`;
  
  // Structure to hold our test results
  const testResults = {
    putObject: { success: false, message: 'Not attempted' },
    getObject: { success: false, message: 'Not attempted' },
    getSignedUrl: { success: false, message: 'Not attempted', url: '' },
    deleteObject: { success: false, message: 'Not attempted' }
  };

  try {
    // Test 1: Upload a file (PutObject)
    try {
      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: testKey,
        Body: testContent,
        ContentType: 'text/plain'
      });
      
      await s3Client.send(putCommand);
      testResults.putObject = { 
        success: true, 
        message: `Successfully uploaded test file to ${testKey}` 
      };
    } catch (error) {
      console.error('Error uploading test file:', error);
      testResults.putObject = { 
        success: false, 
        message: `Failed to upload test file: ${(error as Error).message}` 
      };
      // If this fails, we can't continue with other tests that depend on the file
      throw error;
    }

    // Test 2: Download the file (GetObject)
    try {
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: testKey
      });
      
      const response = await s3Client.send(getCommand);
      
      // Read the content of the file to verify
      if (response.Body) {
        // Use transformToString() to get the file content as a string
        const result = await response.Body.transformToString();
        const isContentCorrect = result === testContent;
        
        testResults.getObject = { 
          success: true, 
          message: `Successfully downloaded test file. Content verification: ${isContentCorrect ? 'Passed' : 'Failed'}` 
        };
      } else {
        testResults.getObject = { 
          success: false, 
          message: 'File was retrieved but had no content' 
        };
      }
    } catch (error) {
      console.error('Error downloading test file:', error);
      testResults.getObject = { 
        success: false, 
        message: `Failed to download test file: ${(error as Error).message}` 
      };
    }

    // Test 3: Generate a pre-signed URL for the object
    try {
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: testKey
      });
      
      const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
      
      testResults.getSignedUrl = { 
        success: true, 
        message: 'Successfully generated pre-signed URL for the test file',
        url: signedUrl
      };
    } catch (error) {
      console.error('Error generating signed URL:', error);
      testResults.getSignedUrl = { 
        success: false, 
        message: `Failed to generate pre-signed URL: ${(error as Error).message}`,
        url: ''
      };
    }

    // Test 4: Delete the test file (DeleteObject)
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: testKey
      });
      
      await s3Client.send(deleteCommand);
      testResults.deleteObject = { 
        success: true, 
        message: `Successfully deleted test file from ${testKey}` 
      };
    } catch (error) {
      console.error('Error deleting test file:', error);
      testResults.deleteObject = { 
        success: false, 
        message: `Failed to delete test file: ${(error as Error).message}` 
      };
    }

    // Determine overall status
    const allSuccessful = Object.values(testResults).every(r => r.success);
    
    return NextResponse.json({
      success: allSuccessful,
      message: allSuccessful 
        ? 'All S3 operations completed successfully' 
        : 'Some S3 operations failed - see details below',
      testKey,
      results: testResults
    });
    
  } catch (error) {
    console.error('Error testing S3 connection:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Failed to connect to S3: ${(error as Error).message}`,
        results: testResults
      }, 
      { status: 500 }
    );
  }
} 
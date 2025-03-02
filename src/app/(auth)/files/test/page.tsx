/**
 * S3 Connection Test Page
 * 
 * This page tests the connection to AWS S3 and displays the results.
 * It makes a request to the /api/s3-test endpoint and shows the operation results
 * for allowed operations (PutObject, GetObject, DeleteObject).
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function S3TestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to test S3 connection
    async function testS3Connection() {
      try {
        setLoading(true);
        const response = await fetch('/api/s3-test');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to connect to S3');
        }
        
        setTestResult(data);
        setError(null);
      } catch (err) {
        console.error('Error testing S3 connection:', err);
        setError((err as Error).message);
        setTestResult(null);
      } finally {
        setLoading(false);
      }
    }

    testS3Connection();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="py-6">
        <h1 className="text-3xl font-bold text-gray-900">S3 Connection Test</h1>
        <p className="mt-1 text-sm text-gray-500">
          Testing connection to AWS S3 bucket: {process.env.NEXT_PUBLIC_AWS_S3_BUCKET || 'ai-mw-file-storage'}
        </p>
        <div className="mt-4">
          <Link 
            href="/files" 
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            &larr; Back to Files
          </Link>
        </div>
      </div>

      {/* Test result card */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Connection Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className={`${
                testResult?.results && Object.values(testResult.results).every((r: any) => r.success) 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
                } border rounded-md p-4 mb-6`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {testResult?.results && Object.values(testResult.results).every((r: any) => r.success) ? (
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      testResult?.results && Object.values(testResult.results).every((r: any) => r.success)  
                        ? 'text-green-800' 
                        : 'text-yellow-800'
                    }`}>
                      {testResult?.message}
                    </h3>
                    {testResult?.testKey && (
                      <p className="mt-1 text-sm text-gray-600">
                        Test file path: {testResult.testKey}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Operation Results */}
              {testResult?.results && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">S3 Operation Results</h3>
                  
                  {/* PutObject Test */}
                  <div className={`border ${testResult.results.putObject.success ? 'border-green-200' : 'border-red-200'} rounded-md overflow-hidden`}>
                    <div className={`px-4 py-3 ${testResult.results.putObject.success ? 'bg-green-50' : 'bg-red-50'} border-b ${testResult.results.putObject.success ? 'border-green-200' : 'border-red-200'} flex justify-between items-center`}>
                      <h4 className="text-sm font-medium text-gray-900">PutObject (Upload File)</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${testResult.results.putObject.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {testResult.results.putObject.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm text-gray-600">{testResult.results.putObject.message}</p>
                    </div>
                  </div>
                  
                  {/* GetObject Test */}
                  <div className={`border ${testResult.results.getObject.success ? 'border-green-200' : 'border-red-200'} rounded-md overflow-hidden`}>
                    <div className={`px-4 py-3 ${testResult.results.getObject.success ? 'bg-green-50' : 'bg-red-50'} border-b ${testResult.results.getObject.success ? 'border-green-200' : 'border-red-200'} flex justify-between items-center`}>
                      <h4 className="text-sm font-medium text-gray-900">GetObject (Download File)</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${testResult.results.getObject.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {testResult.results.getObject.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm text-gray-600">{testResult.results.getObject.message}</p>
                    </div>
                  </div>
                  
                  {/* Presigned URL Test */}
                  <div className={`border ${testResult.results.getSignedUrl.success ? 'border-green-200' : 'border-red-200'} rounded-md overflow-hidden`}>
                    <div className={`px-4 py-3 ${testResult.results.getSignedUrl.success ? 'bg-green-50' : 'bg-red-50'} border-b ${testResult.results.getSignedUrl.success ? 'border-green-200' : 'border-red-200'} flex justify-between items-center`}>
                      <h4 className="text-sm font-medium text-gray-900">Generate Presigned URL</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${testResult.results.getSignedUrl.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {testResult.results.getSignedUrl.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm text-gray-600">{testResult.results.getSignedUrl.message}</p>
                      {testResult.results.getSignedUrl.url && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Generated URL (valid for 1 hour):</p>
                          <div className="bg-gray-50 p-2 rounded overflow-x-auto">
                            <code className="text-xs break-all">{testResult.results.getSignedUrl.url}</code>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* DeleteObject Test */}
                  <div className={`border ${testResult.results.deleteObject.success ? 'border-green-200' : 'border-red-200'} rounded-md overflow-hidden`}>
                    <div className={`px-4 py-3 ${testResult.results.deleteObject.success ? 'bg-green-50' : 'bg-red-50'} border-b ${testResult.results.deleteObject.success ? 'border-green-200' : 'border-red-200'} flex justify-between items-center`}>
                      <h4 className="text-sm font-medium text-gray-900">DeleteObject (Remove File)</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${testResult.results.deleteObject.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {testResult.results.deleteObject.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm text-gray-600">{testResult.results.deleteObject.message}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Info about IAM policy */}
      <div className="mt-6 bg-blue-50 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-blue-800">IAM Policy Information</h3>
          <p className="mt-2 text-sm text-blue-600">
            The S3 tests are based on the following IAM policy, which allows only these operations:
          </p>
          <div className="mt-3 bg-white rounded-md overflow-x-auto p-4 text-sm">
            <pre className="text-xs">
{`{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::ai-mw-file-storage/uploads/*",
                "arn:aws:s3:::ai-mw-file-storage/processed/*"
            ]
        }
    ]
}`}
            </pre>
          </div>
          <p className="mt-3 text-sm text-blue-600">
            Operations like ListBuckets or ListObjects are not allowed by this policy, only direct operations on files in the specified paths.
          </p>
        </div>
      </div>
    </div>
  );
} 
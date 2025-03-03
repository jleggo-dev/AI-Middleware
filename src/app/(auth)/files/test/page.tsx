/**
 * S3 Connection Test Page
 * 
 * This page tests the connection to AWS S3 and displays the results.
 * It makes a request to the /api/s3-test endpoint and shows the operation results
 * for allowed operations (PutObject, GetObject, DeleteObject).
 */

'use client';

import React, { useState } from 'react';

interface TestResult {
  success: boolean;
  message: string;
}

interface SignedUrlResult extends TestResult {
  url?: string;
}

interface S3TestResult {
  success: boolean;
  message: string;
  testKey?: string;
  results: {
    putObject: TestResult;
    getObject: TestResult;
    getSignedUrl: SignedUrlResult;
    deleteObject: TestResult;
  };
}

export default function S3TestPage() {
  const [testResult, setTestResult] = useState<S3TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setIsLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await fetch('/api/s3-test');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTestResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">S3 Connection Test</h1>
      
      <button
        onClick={runTest}
        disabled={isLoading}
        className="mb-8 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isLoading ? 'Running Test...' : 'Run Test'}
      </button>

      {error && (
        <div className="mb-8 p-4 rounded-md bg-red-50 border border-red-200">
          <h3 className="text-sm font-bold text-red-800">Error</h3>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}

      {testResult && (
        <div className="space-y-4">
          <div className={`p-4 rounded-md ${
            testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className="text-sm font-bold text-gray-900">Overall Test Result</h3>
            <p className="mt-1 text-sm text-gray-500">{testResult.message}</p>
          </div>

          {/* Individual operation results */}
          {Object.entries(testResult.results).map(([operation, result]) => (
            <div
              key={operation}
              className={`p-4 rounded-md ${
                result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              <h3 className="text-sm font-bold text-gray-900">
                {operation.charAt(0).toUpperCase() + operation.slice(1)}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{result.message}</p>
              {operation === 'getSignedUrl' && (result as SignedUrlResult).url && (
                <a
                  href={(result as SignedUrlResult).url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                >
                  View File
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
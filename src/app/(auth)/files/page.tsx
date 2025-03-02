/**
 * Files Page
 * 
 * This page provides file upload functionality to S3.
 * Currently focused on uploads only - listing and deletion features
 * will be implemented in future iterations.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DocumentIcon } from '@heroicons/react/24/outline';
import FileUploader from '@/components/FileUploader';

interface File {
  key: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export default function FilesPage() {
  const [error, setError] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Handle file upload completion
  const handleUploadComplete = (fileData: File) => {
    // Add the newly uploaded file to the list of successful uploads
    setUploadedFiles(prevFiles => [fileData, ...prevFiles]);
    
    // Show a success message
    console.log('File uploaded successfully:', fileData.name);
  };

  // Handle file upload error
  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error);
    setError(`Upload failed: ${error.message}`);
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Files</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload files to your account
        </p>
        <div className="mt-4 flex space-x-3">
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {showUploader ? 'Cancel Upload' : 'Upload File'}
          </button>
          <Link 
            href="/files/test" 
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Test S3 Connection
          </Link>
        </div>
      </div>

      {/* File Uploader */}
      {showUploader && (
        <div className="mb-8 bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upload New File</h2>
          <FileUploader
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            multiple={true}
            maxSizeMB={100}
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recently Uploaded Files (Session Only) */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recently Uploaded Files</h2>
            <p className="text-sm text-gray-500 mb-4">
              These files were uploaded in your current session. This list will clear when you refresh the page.
            </p>
            
            <ul className="divide-y divide-gray-200">
              {uploadedFiles.map((file) => (
                <li key={file.key} className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DocumentIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">{file.name}</h3>
                        <div className="text-xs text-gray-500 mt-1 flex space-x-4">
                          <span>{formatFileSize(file.size)}</span>
                          <span>Type: {file.type || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                    {file.url && (
                      <button 
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        View
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Placeholder message when no uploader is shown and no files uploaded */}
      {!showUploader && uploadedFiles.length === 0 && !error && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center py-12">
              <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Upload files to get started</h3>
              <p className="mt-1 text-sm text-gray-500">
                Click the Upload File button above to upload your first file.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowUploader(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Upload a File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
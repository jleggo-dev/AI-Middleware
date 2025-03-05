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
import { FileTreeView } from '@/components/FileTreeView';
import { FileControls } from '@/components/FileControls';
import { useFiles } from '@/hooks/useFiles';

export default function FilesPage() {
  const [error, setError] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  
  const {
    loading,
    error: fetchError,
    data,
    params,
    updateParams,
    fileTypes = [],
    refresh
  } = useFiles();

  // Handle file upload completion
  const handleUploadComplete = () => {
    setShowUploader(false);
    refresh();
  };

  // Handle file upload error
  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error);
    setError(`Upload failed: ${error.message}`);
  };

  // Placeholder delete handler
  const handleDelete = (id: string) => {
    console.log('Delete file:', id);
    // TODO: Implement delete functionality
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Files</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your files
        </p>
        <div className="mt-4 flex space-x-3">
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {showUploader ? 'Back to Files' : 'Upload File'}
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

      {/* Error messages */}
      {(error || fetchError) && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || fetchError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls and File Tree */}
      {data && (
        <>
          <FileControls
            params={params}
            onParamsChange={updateParams}
            fileTypes={fileTypes}
            totalCount={data.totalCount}
            currentPage={data.currentPage}
            totalPages={data.totalPages}
          />

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : data.files.length > 0 ? (
            <div className="bg-white shadow rounded-lg">
              <FileTreeView
                nodes={data.files}
                onDelete={handleDelete}
              />
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-center py-12">
                  <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {params.filterStatus || params.filterType
                      ? 'Try adjusting your filters'
                      : 'Upload files to get started'}
                  </p>
                  {!params.filterStatus && !params.filterType && (
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => setShowUploader(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Upload a File
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 
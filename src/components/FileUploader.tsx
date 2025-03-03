/**
 * File Uploader Component
 * 
 * A reusable component for uploading files directly to S3 using pre-signed URLs.
 * Features:
 * - Drag and drop support
 * - File selection via browser dialog
 * - Upload progress tracking
 * - Error handling
 * - Success feedback
 */

'use client';

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { ArrowUpTrayIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

// Helper function to update file status
async function updateFileStatus(fileId: string, status: string, error_message?: string) {
  try {
    const response = await fetch('/api/files/status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileId,
        status,
        error_message
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update file status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to update file status');
    }

    return data.file;
  } catch (error) {
    console.error('Error updating file status:', error);
    throw error;
  }
}

interface FileUploaderProps {
  onUploadComplete?: (fileData: UploadedFile) => void;
  onUploadError?: (error: Error) => void;
  multiple?: boolean;
  accept?: string;
  maxSizeMB?: number;
  prefix?: string;
}

interface UploadedFile {
  key: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

interface FileWithStatus {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  key?: string;
  url?: string;
  fileId?: string;
}

export default function FileUploader({
  onUploadComplete,
  onUploadError,
  multiple = false,
  accept = '*',
  maxSizeMB = 100,
  prefix = 'uploads/'
}: FileUploaderProps) {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Handle file browse button click
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };
  
  // Process files selected via input or dropped
  const processFiles = (fileList: FileList) => {
    const newFiles: FileWithStatus[] = [];
    
    Array.from(fileList).forEach(file => {
      // Skip if multiple is false and we already have a file
      if (!multiple && files.length > 0) return;
      
      // Check file size
      const maxSize = maxSizeMB * 1024 * 1024;
      if (file.size > maxSize) {
        const errorFile: FileWithStatus = {
          file,
          id: crypto.randomUUID(),
          progress: 0,
          status: 'error',
          error: `File too large. Maximum size is ${maxSizeMB}MB`
        };
        newFiles.push(errorFile);
        return;
      }
      
      // Add file to list
      newFiles.push({
        file,
        id: crypto.randomUUID(),
        progress: 0,
        status: 'pending'
      });
    });
    
    if (newFiles.length > 0) {
      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
      setFiles(updatedFiles);
      
      // Start uploading new files
      newFiles.forEach(fileWithStatus => {
        if (fileWithStatus.status !== 'error') {
          uploadFile(fileWithStatus);
        }
      });
    }
  };
  
  // Handle file input change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = ''; // Reset input
    }
  };
  
  // Handle drag events
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };
  
  // Upload file to S3 using pre-signed URL
  const uploadFile = async (fileWithStatus: FileWithStatus) => {
    try {
      // Update file status to uploading
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.id === fileWithStatus.id 
            ? { ...f, status: 'uploading' } 
            : f
        )
      );
      
      // Step 1: Request pre-signed URL from the server
      const response = await fetch('/api/files/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: fileWithStatus.file.name,
          contentType: fileWithStatus.file.type || 'application/octet-stream',
          prefix
        }),
      });
      
      if (!response.ok) {
        // Handle common HTTP error statuses
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in to upload files.');
        }
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to get upload URL');
      }
      
      // Set progress to show upload has started
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.id === fileWithStatus.id 
            ? { ...f, progress: 10, fileId: data.fileId } 
            : f
        )
      );
      
      // Step 2: Upload the file directly to S3 using the pre-signed URL
      const uploadResponse = await fetch(data.url, {
        method: 'PUT',
        headers: {
          'Content-Type': fileWithStatus.file.type || 'application/octet-stream',
        },
        body: fileWithStatus.file
      });
      
      if (!uploadResponse.ok) {
        // Update file status to failed
        if (data.fileId) {
          await updateFileStatus(
            data.fileId,
            'failed',
            `Failed to upload to S3: ${uploadResponse.status} ${uploadResponse.statusText}`
          );
        }
        throw new Error(`Failed to upload file to S3: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }
      
      // Update file status to uploaded
      if (data.fileId) {
        await updateFileStatus(data.fileId, 'uploaded');
      }
      
      // Update file status to success
      const updatedFile = {
        ...fileWithStatus,
        status: 'success' as const,
        progress: 100,
        key: data.key,
        url: data.url,
        fileId: data.fileId
      };
      
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.id === fileWithStatus.id 
            ? updatedFile
            : f
        )
      );
      
      // Call completion callback
      if (onUploadComplete) {
        onUploadComplete({
          key: data.key,
          name: fileWithStatus.file.name,
          size: fileWithStatus.file.size,
          type: fileWithStatus.file.type,
          url: data.url
        });
      }
      
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Update file status to error in component state
      const errorFile = {
        ...fileWithStatus,
        status: 'error' as const,
        error: (error as Error).message
      };
      
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.id === fileWithStatus.id 
            ? errorFile
            : f
        )
      );
      
      // Update file status in Supabase if we have a fileId
      if (fileWithStatus.fileId) {
        try {
          await updateFileStatus(
            fileWithStatus.fileId,
            'failed',
            (error as Error).message
          );
        } catch (statusError) {
          console.error('Failed to update file status:', statusError);
        }
      }
      
      // Call error callback
      if (onUploadError) {
        onUploadError(error as Error);
      }
    }
  };
  
  // Remove a file from the list
  const removeFile = (fileId: string) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
  };
  
  // Retry a failed upload
  const retryUpload = (fileWithStatus: FileWithStatus) => {
    setFiles(prevFiles => 
      prevFiles.map(f => 
        f.id === fileWithStatus.id 
          ? { ...f, status: 'pending', progress: 0, error: undefined } 
          : f
      )
    );
    
    uploadFile({
      ...fileWithStatus,
      status: 'pending',
      progress: 0,
      error: undefined
    });
  };
  
  return (
    <div className="w-full">
      {/* Drag & Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-gray-300 hover:border-indigo-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          <span>Drag & drop your files here</span>
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          or <span className="text-indigo-600 font-medium">browse</span> to select files
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {multiple ? 'You can upload multiple files' : 'You can only upload one file'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Maximum file size: {maxSizeMB} MB
        </p>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Files</h4>
          <ul className="divide-y divide-gray-200 border rounded-md overflow-hidden">
            {files.map((fileWithStatus) => (
              <li key={fileWithStatus.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <DocumentIcon className="h-6 w-6 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileWithStatus.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileWithStatus.file.size)}
                    </p>
                  </div>
                </div>
                
                {/* Status indicators */}
                <div className="flex items-center space-x-2">
                  {fileWithStatus.status === 'pending' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      Pending
                    </span>
                  )}
                  
                  {fileWithStatus.status === 'uploading' && (
                    <div className="w-24 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${fileWithStatus.progress}%` }}
                      ></div>
                    </div>
                  )}
                  
                  {fileWithStatus.status === 'success' && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                  
                  {fileWithStatus.status === 'error' && (
                    <div className="flex items-center">
                      <XCircleIcon className="h-5 w-5 text-red-500 mr-1" />
                      <span className="text-xs text-red-500 truncate max-w-xs">
                        {fileWithStatus.error || 'Upload failed'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          retryUpload(fileWithStatus);
                        }}
                        className="ml-2 text-xs text-indigo-600 hover:text-indigo-500"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(fileWithStatus.id);
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 
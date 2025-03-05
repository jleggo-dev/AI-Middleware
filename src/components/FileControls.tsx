/**
 * FileControls Component
 * 
 * A component that provides UI controls for managing file list display including:
 * - Sorting (by name, creation date, or processing date)
 * - Status filtering (uploaded, processing, completed, failed)
 * - File type filtering
 * - Pagination controls
 * 
 * @dependencies
 * - Requires FileListParams and FileStatus types from @/types/files
 * - Uses Tailwind CSS for styling
 * 
 * @interactions
 * - Receives current params and updates them via onParamsChange callback
 * - Displays available file types from the current file list
 * - Shows pagination info and controls based on total count and current page
 */

import React from 'react';
import { FileListParams, FileStatus } from '@/types/files';

interface FileControlsProps {
  params: FileListParams;
  onParamsChange: (params: Partial<FileListParams>) => void;
  fileTypes: string[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

type SortableFields = 'name' | 'created_at' | 'last_processing_date';

export const FileControls: React.FC<FileControlsProps> = ({
  params,
  onParamsChange,
  fileTypes,
  totalCount,
  currentPage,
  totalPages,
}) => {
  const statusOptions: FileStatus[] = ['uploaded', 'processing', 'completed', 'failed'];

  const isSortableField = (value: string): value is SortableFields => {
    return ['name', 'created_at', 'last_processing_date'].includes(value);
  };

  const isFileStatus = (value: string): value is FileStatus => {
    return statusOptions.includes(value as FileStatus);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (isSortableField(value)) {
      onParamsChange({ sortBy: value });
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onParamsChange({
      filterStatus: value ? (isFileStatus(value) ? value : undefined) : undefined
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sort Controls */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort by
          </label>
          <div className="flex space-x-2">
            <select
              value={params.sortBy}
              onChange={handleSortChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="name">Name</option>
              <option value="created_at">Creation Date</option>
              <option value="last_processing_date">Processing Date</option>
            </select>
            <button
              onClick={() =>
                onParamsChange({
                  sortOrder: params.sortOrder === 'asc' ? 'desc' : 'asc',
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {params.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={params.filterStatus || ''}
            onChange={handleStatusChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* File Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File Type
          </label>
          <select
            value={params.filterType || ''}
            onChange={(e) =>
              onParamsChange({ filterType: e.target.value || undefined })
            }
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All</option>
            {fileTypes.map((type) => (
              <option key={type} value={type}>
                {type.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Items per page */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Items per page
          </label>
          <select
            value={params.pageSize}
            onChange={(e) =>
              onParamsChange({
                pageSize: Number(e.target.value),
                page: 1,
              })
            }
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="text-sm text-gray-700">
          Showing{' '}
          <span className="font-medium">
            {totalCount === 0 ? 0 : (currentPage - 1) * params.pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-medium">
            {Math.min(currentPage * params.pageSize, totalCount)}
          </span>{' '}
          of <span className="font-medium">{totalCount}</span> results
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onParamsChange({ page: currentPage - 1 })}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => onParamsChange({ page: currentPage + 1 })}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}; 
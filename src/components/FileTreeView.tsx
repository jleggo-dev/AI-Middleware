/**
 * FileTreeView Component
 * 
 * A hierarchical tree view component that displays files and folders in a nested structure.
 * Provides interactive elements for expanding/collapsing folders and managing files.
 * 
 * Features:
 * - Expandable/collapsible folder nodes
 * - File status indicators with color coding
 * - File metadata display (creation date, processing date, status)
 * - Delete functionality for files
 * - Error message display for failed files
 * 
 * @dependencies
 * - Uses @heroicons/react for icons
 * - Requires FileNode type from @/types/files
 * - Uses Tailwind CSS for styling
 * 
 * @interactions
 * - Manages expand/collapse state for folders
 * - Calls onDelete callback when delete button is clicked
 * - Displays file metadata and status information
 */

import React, { useState } from 'react';
import { ChevronRightIcon, ChevronDownIcon, FolderIcon, DocumentIcon, TrashIcon } from '@heroicons/react/24/outline';
import { FileNode, FileStatus } from '@/types/files';

interface FileTreeViewProps {
  nodes: FileNode[];
  onDelete?: (id: string) => void;
}

interface FileTreeNodeProps extends FileTreeViewProps {
  level: number;
}

const getStatusColor = (status: FileStatus) => {
  switch (status) {
    case 'uploaded':
      return 'text-blue-600';
    case 'processing':
      return 'text-yellow-600';
    case 'completed':
      return 'text-green-600';
    case 'failed':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const FileTreeNode: React.FC<FileTreeNodeProps> = ({ nodes, level, onDelete }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (path: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedNodes(newExpanded);
  };

  return (
    <ul className="space-y-1">
      {nodes.map((node) => {
        const isExpanded = expandedNodes.has(node.path);
        const paddingLeft = level * 1.5;

        return (
          <li key={node.path}>
            <div
              className={`flex items-start group hover:bg-gray-50 rounded-lg p-2`}
              style={{ paddingLeft: `${paddingLeft}rem` }}
            >
              <div className="flex-1">
                <div className="flex items-center">
                  {/* Expand/Collapse icon or spacer */}
                  {node.type === 'folder' ? (
                    <button
                      onClick={() => toggleNode(node.path)}
                      className="w-5 h-5 mr-1 text-gray-500 hover:text-gray-700"
                    >
                      {isExpanded ? (
                        <ChevronDownIcon className="w-4 h-4" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    <span className="w-5 mr-1" />
                  )}

                  {/* Icon */}
                  {node.type === 'folder' ? (
                    <FolderIcon className="w-5 h-5 text-yellow-500 mr-2" />
                  ) : (
                    <DocumentIcon className="w-5 h-5 text-blue-500 mr-2" />
                  )}

                  {/* Name */}
                  <span className="font-medium">{node.name}</span>

                  {/* File details */}
                  {node.type === 'file' && node.fileData && (
                    <div className="ml-4 flex items-center space-x-4 text-sm text-gray-500">
                      <span className={getStatusColor(node.fileData.status)}>
                        {node.fileData.status}
                      </span>
                      <span>Created: {formatDate(node.fileData.created_at)}</span>
                      <span>Last processed: {formatDate(node.fileData.last_processing_date)}</span>
                      {node.fileData.error_message && (
                        <span className="text-red-600">Error: {node.fileData.error_message}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {node.type === 'file' && node.id && onDelete && (
                <button
                  onClick={() => onDelete(node.id!)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Render children if expanded */}
            {node.type === 'folder' && isExpanded && node.children && (
              <FileTreeNode
                nodes={node.children}
                level={level + 1}
                onDelete={onDelete}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};

export const FileTreeView: React.FC<FileTreeViewProps> = ({ nodes, onDelete }) => {
  return <FileTreeNode nodes={nodes} level={0} onDelete={onDelete} />;
}; 
'use client'

/**
 * File Content Test Page
 * 
 * Tests the file content retrieval API and demonstrates how content
 * will be used with the MessageConstructor component.
 * 
 * Features:
 * - File browser with hierarchical folder structure
 * - Preview of file content (CSV headers and first row, or first two lines of text)
 * - Unified handling for both CSV and text files using MessageConstructor
 * - Pre-selection of columns for text files with proper naming
 * - Error handling and loading states
 */

import { useEffect, useState } from 'react'
import { MessageConstructor } from '@/components/MessageConstructor'
import type { Config } from '@/components/MessageConstructor/store'

/**
 * FileNode interface representing items in the file tree structure
 */
interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  children?: FileNode[]
  s3_key?: string
  original_name?: string
  status?: string
}

/**
 * FileContent interface representing the unified response format from the API
 * All file types are formatted to work with MessageConstructor
 */
interface FileContent {
  type: 'csv' | 'text'
  columns?: Array<{ id: string; name: string; selected: boolean }>
  firstRow?: Record<string, string>
  warning?: string
}

export default function FileContentTestPage() {
  const [files, setFiles] = useState<FileNode[]>([])
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [fileContent, setFileContent] = useState<FileContent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles()
  }, [])

  // Fetch files from the API
  const fetchFiles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/files')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch files')
      }
      
      console.log('Files response:', data)
      if (!data.files || !Array.isArray(data.files)) {
        console.warn('No files array in response:', data)
        setFiles([])
        return
      }
      
      // Ensure all nodes have an id - required for proper tree rendering
      const processNodes = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => ({
          ...node,
          id: node.id || `node-${Math.random().toString(36).substring(2, 11)}`,
          children: node.children ? processNodes(node.children) : undefined
        }))
      }
      
      setFiles(processNodes(data.files))
    } catch (error) {
      setError('Failed to load files')
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch file content when a file is selected
  // Both CSV and text files are returned in a format compatible with MessageConstructor
  // - CSV files: Columns and first row data
  // - Text files: Single pre-selected column with the filename as name
  const fetchFileContent = async (fileId: string) => {
    setLoading(true)
    setError(null)
    setFileContent(null)
    
    try {
      const response = await fetch(`/api/files/content/${fileId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch file content')
      }
      
      console.log('File content response:', data)
      setFileContent(data)
    } catch (error) {
      setError(`Failed to load file content: ${error instanceof Error ? error.message : String(error)}`)
      console.error('Error fetching file content:', error)
    } finally {
      setLoading(false)
    }
  }

  // Render file tree recursively
  const renderFileTree = (nodes: FileNode[]) => {
    return (
      <ul className="pl-4">
        {nodes.map((node) => (
          <li key={node.id} className="py-1">
            {node.type === 'folder' ? (
              <div className="flex items-center text-gray-700">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="font-medium">{node.name}</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  setSelectedFile(node)
                  fetchFileContent(node.id)
                }}
                className={`flex items-center text-sm ${
                  selectedFile?.id === node.id
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {node.original_name || node.name}
              </button>
            )}
            {node.children && renderFileTree(node.children)}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">File Content Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File List Panel */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Files</h2>
          {loading && !files.length && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {!loading && !files.length && (
            <div className="text-center py-8 text-gray-500">
              <p>No files found</p>
              <button 
                onClick={fetchFiles} 
                className="mt-2 text-blue-500 hover:text-blue-700"
              >
                Refresh
              </button>
            </div>
          )}
          
          {files.length > 0 && renderFileTree(files)}
        </div>

        {/* Content Display Panel */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">File Content</h2>
          
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded">
              {error}
            </div>
          )}

          {fileContent && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium mb-2">File Type: {fileContent.type}</h3>
                {fileContent.warning && (
                  <div className="text-amber-600 text-sm mb-2">
                    Warning: {fileContent.warning}
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-1">Columns:</h4>
                  <ul className="list-disc list-inside mb-2">
                    {fileContent.columns?.map(col => (
                      <li key={col.id}>{col.name} {col.selected && <span className="text-green-600">(Selected)</span>}</li>
                    ))}
                  </ul>
                  <h4 className="font-medium mb-1">First Row Data:</h4>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                    {JSON.stringify(fileContent.firstRow, null, 2)}
                  </pre>
                </div>
              </div>

              {/* MessageConstructor Preview - works with both CSV and text files */}
              {fileContent.columns && fileContent.firstRow && (
                <div>
                  <h3 className="font-medium mb-2">MessageConstructor Preview:</h3>
                  <MessageConstructor
                    mockColumns={fileContent.columns}
                    mockFirstRow={fileContent.firstRow}
                    onConfigUpdate={(config: Config) => {
                      console.log('Config updated:', config)
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
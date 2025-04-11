/**
 * CreateMessageModal Component
 * 
 * A modal dialog for creating new message templates from uploaded files.
 * Features:
 * - File selection from existing uploads
 * - Direct file upload capability
 * - File content preview
 * - Message template configuration
 * - Live preview of constructed messages
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { MessageConstructor } from '@/components/MessageConstructor'
import FileUploader from '@/components/FileUploader'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { FileRecord } from '@/types/files'
import { Config as MessageConfig } from '@/components/MessageConstructor/store'

interface CreateMessageModalProps {
  isOpen: boolean
  onClose: () => void
  onTemplateCreated?: () => void
}

interface Folder {
  id: string
  name: string
}

interface FileContent {
  type: 'csv' | 'txt' | 'text'
  columns: Array<{
    id: string
    name: string
    selected: boolean
    order: number
    preface?: string
    closing?: string
  }>
  firstRow: Record<string, string>
  warning?: string
}

interface TemplateConfig {
  type: 'csv' | 'txt'
  intro: string
  conclusion: string
  columns: Array<{
    id: string
    name: string
    selected: boolean
    order: number
    preface: string
    closing: string
  }>
  firstRow: Record<string, string>
}

export function CreateMessageModal({ isOpen, onClose, onTemplateCreated }: CreateMessageModalProps) {
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null)
  const [fileContent, setFileContent] = useState<FileContent | null>(null)
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [files, setFiles] = useState<FileRecord[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const supabase = createClientComponentClient()

  // Fetch user's files and folders on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        // Fetch files
        const { data: filesData, error: filesError } = await supabase
          .from('files')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'uploaded')
          .order('created_at', { ascending: false })

        if (filesError) throw filesError
        setFiles(filesData || [])

        // Fetch folders
        const { data: foldersData, error: foldersError } = await supabase
          .from('template_folders')
          .select('id, name')
          .eq('user_id', session.user.id)
          .order('name')

        if (foldersError) throw foldersError
        setFolders(foldersData || [])
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data')
      }
    }

    if (isOpen) {
      fetchData()
    }
  }, [isOpen, supabase])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null)
      setFileContent(null)
      setTemplateConfig(null)
      setError(null)
      setSuccess(null)
      setSelectedFolderId(null)
      setTemplateName('')
      setTemplateDescription('')
    }
  }, [isOpen])

  // Fetch file content when a file is selected
  useEffect(() => {
    const fetchFileContent = async () => {
      if (!selectedFile) return

      setLoading(true)
      setError(null)

      try {
        console.log('Fetching content for file:', selectedFile.id)
        const response = await fetch(`/api/files/content-by-id?fileId=${selectedFile.id}`)
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Error response:', errorText)
          throw new Error(`Failed to fetch file content: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log('Response data:', data)
        
        if (!data.success) {
          console.error('Error in response data:', data)
          throw new Error(data.message || 'Failed to process file content')
        }

        // Set the file content with the proper structure
        setFileContent({
          type: data.type,
          columns: data.columns,
          firstRow: data.firstRow,
          warning: data.warning
        })
      } catch (err) {
        console.error('Error fetching file content:', err)
        if (err instanceof Error) {
          console.error('Error details:', {
            message: err.message,
            stack: err.stack,
            name: err.name
          })
        }
        setError(err instanceof Error ? err.message : 'Failed to load file content')
      } finally {
        setLoading(false)
      }
    }

    fetchFileContent()
  }, [selectedFile])

  // Handle file selection
  const handleFileSelect = (file: FileRecord) => {
    setSelectedFile(file)
  }

  // Handle file upload completion
  const handleUploadComplete = () => {
    // Refresh the file list
    const fetchFiles = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'uploaded')
        .order('created_at', { ascending: false })

      if (!error) {
        setFiles(data || [])
      }
    }

    fetchFiles()
  }

  // Handle file upload error
  const handleUploadError = (error: Error) => {
    setError(error.message)
  }

  // Handle template configuration update
  const handleConfigUpdate = useCallback((config: MessageConfig) => {
    // Convert MessageConfig to TemplateConfig
    const templateConfig: TemplateConfig = {
      type: 'txt', // Default type
      intro: config.introduction,
      conclusion: config.conclusion,
      columns: config.selectedColumns.map(col => ({
        id: col.id,
        name: col.name,
        selected: col.selected,
        order: col.order,
        preface: col.preface || '',
        closing: col.closing || ''
      })),
      firstRow: fileContent?.firstRow || {}
    }
    setTemplateConfig(templateConfig)
  }, [fileContent])

  // Handle template save
  const handleSave = async () => {
    if (!selectedFile || !fileContent || !templateConfig) return

    // Validate template name
    if (templateName.length < 3) {
      setError('Template name must be at least 3 characters long')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Prepare template data according to schema
      const templateData = {
        name: templateName,
        description: templateDescription,
        type: fileContent.type === 'text' ? 'txt' : fileContent.type,
        folderId: selectedFolderId,
        config: {
          type: fileContent.type === 'text' ? 'txt' : fileContent.type,
          intro: templateConfig.intro || '',
          conclusion: templateConfig.conclusion || '',
          columns: fileContent.columns.map(col => ({
            id: col.id,
            name: col.name,
            selected: col.selected,
            order: col.order,
            preface: col.preface || '',
            closing: col.closing || ''
          })),
          firstRow: fileContent.firstRow
        }
      }

      console.log('Saving template data:', templateData)

      // Save template to database
      const response = await fetch('/api/templates/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      })

      const responseData = await response.json()
      console.log('Save response:', responseData)

      if (!response.ok) {
        if (responseData.details) {
          // Format validation errors into a readable message
          const validationErrors = responseData.details
            .map((err: { path: string[]; message: string }) => `${err.path.join('.')}: ${err.message}`)
            .join('\n')
          throw new Error(`Validation failed:\n${validationErrors}`)
        }
        throw new Error(responseData.message || 'Failed to save template')
      }
      
      if (responseData.success) {
        setSuccess(`Template "${templateName}" saved successfully!`)
        
        // Refresh template list
        if (onTemplateCreated) {
          onTemplateCreated()
        }
      } else {
        throw new Error(responseData.message || 'Failed to save template')
      }
    } catch (err) {
      console.error('Error saving template:', err)
      setError(err instanceof Error ? err.message : 'Failed to save template')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Create Message Template</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-4rem)]">
          {/* File Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Select a File</h3>
            
            {/* File Uploader */}
            <div className="mb-4">
              <FileUploader
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                multiple={false}
                accept=".csv,.txt"
                maxSizeMB={10}
              />
            </div>

            {/* File List */}
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((file) => (
                    <tr
                      key={file.id}
                      onClick={() => handleFileSelect(file)}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        selectedFile?.id === file.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {file.original_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {file.original_name.endsWith('.csv') ? 'CSV' : 'Text'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(file.created_at).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {/* Success Display */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg">
              {success}
            </div>
          )}

          {/* Warning Display */}
          {fileContent?.warning && (
            <div className="mb-4 p-4 bg-yellow-50 text-yellow-600 rounded-lg">
              {fileContent.warning}
            </div>
          )}

          {/* Template Configuration */}
          {selectedFile && !loading && !error && fileContent && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Configure Message Template</h3>
              
              {/* Template Name and Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter template name"
                    minLength={3}
                    required
                  />
                  {templateName.length > 0 && templateName.length < 3 && (
                    <p className="mt-1 text-sm text-red-600">
                      Template name must be at least 3 characters long
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="templateDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    id="templateDescription"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter template description"
                  />
                </div>
              </div>

              {/* Folder Selection */}
              <div className="mb-6">
                <label htmlFor="folderSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Folder (Optional)
                </label>
                <select
                  id="folderSelect"
                  value={selectedFolderId || ''}
                  onChange={(e) => setSelectedFolderId(e.target.value || null)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Constructor */}
              <MessageConstructor
                mockColumns={fileContent.columns}
                mockFirstRow={fileContent.firstRow}
                onConfigUpdate={handleConfigUpdate}
              />

              {/* Save Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={loading || templateName.length < 3}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
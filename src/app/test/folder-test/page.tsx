'use client'

import { useState, useEffect } from 'react'

interface Folder {
  id: string
  name: string
  user_id: string
  parent_folder_id: string | null
  created_at: string
  updated_at: string
}

interface FolderNode extends Folder {
  children: FolderNode[]
}

export default function FolderTestPage() {
  const [folders, setFolders] = useState<FolderNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch folders on mount
  useEffect(() => {
    fetchFolders()
  }, [])

  const fetchFolders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/folders')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch folders')
      }

      setFolders(data.folders)
    } catch (err) {
      console.error('Error fetching folders:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch folders')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newFolderName,
          parentFolderId: selectedParentId
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to create folder')
      }

      setSuccess(`Folder "${newFolderName}" created successfully!`)
      setNewFolderName('')
      setSelectedParentId(null)
      fetchFolders() // Refresh the folder list
    } catch (err) {
      console.error('Error creating folder:', err)
      setError(err instanceof Error ? err.message : 'Failed to create folder')
    } finally {
      setLoading(false)
    }
  }

  const renderFolderTree = (folderNodes: FolderNode[], level = 0) => {
    return (
      <ul className={`ml-${level * 4} space-y-1`}>
        {folderNodes.map((folder) => (
          <li key={folder.id} className="py-1">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">
                {'└'.repeat(level)} {folder.name}
              </span>
              <button
                onClick={() => setSelectedParentId(folder.id)}
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                (Create Subfolder)
              </button>
            </div>
            {folder.children.length > 0 && renderFolderTree(folder.children, level + 1)}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Folder Management Test</h1>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Create Folder Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Folder</h2>
        <form onSubmit={handleCreateFolder} className="space-y-4">
          <div>
            <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-1">
              Folder Name
            </label>
            <input
              type="text"
              id="folderName"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter folder name"
              required
            />
          </div>

          <div>
            <label htmlFor="parentFolder" className="block text-sm font-medium text-gray-700 mb-1">
              Parent Folder (Optional)
            </label>
            <select
              id="parentFolder"
              value={selectedParentId || ''}
              onChange={(e) => setSelectedParentId(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Root Level</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Folder'}
          </button>
        </form>
      </div>

      {/* Folder Tree View */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Folder Structure</h2>
        {loading ? (
          <p className="text-gray-500">Loading folders...</p>
        ) : folders.length === 0 ? (
          <p className="text-gray-500">No folders created yet</p>
        ) : (
          renderFolderTree(folders)
        )}
      </div>
    </div>
  )
} 
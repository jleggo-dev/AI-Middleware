/**
 * Messages Page
 * 
 * This page displays the user's messages and provides messaging functionality.
 * It is a protected page that requires authentication to access.
 * 
 * Features:
 * - List of user's messages (placeholder)
 * - Create new message template
 * - Message management options
 */

'use client'

import { useState, useEffect } from 'react'
import { FolderIcon, PencilIcon, TrashIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface Message {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  folderId: string | null
}

interface Folder {
  id: string
  name: string
  messages: Message[]
}

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [folders, setFolders] = useState<Folder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/messages')
        if (!response.ok) {
          throw new Error('Failed to fetch messages')
        }
        const data = await response.json()
        setFolders(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [])

  const handleCreateMessage = () => {
    // TODO: Implement create message functionality
    console.log('Create message clicked')
  }

  const handleEditMessage = (message: Message) => {
    setSelectedMessage(message)
    // TODO: Implement edit message functionality
    console.log('Edit message:', message)
  }

  const handleDeleteMessage = (message: Message) => {
    setSelectedMessage(message)
    setShowDeleteDialog(true)
  }

  const handleMoveMessage = (message: Message) => {
    setSelectedMessage(message)
    // TODO: Implement move functionality
    console.log('Move message:', message)
  }

  const confirmDelete = async () => {
    if (!selectedMessage) return
    // TODO: Implement delete functionality
    setShowDeleteDialog(false)
    setSelectedMessage(null)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <FolderIcon className="h-4 w-4" />
          <span>Messages</span>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleCreateMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Message
          </button>
          <button
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Manage Folders
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {folders.map((folder) => (
          <div key={folder.id} className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">{folder.name}</h2>
            </div>
            <div className="divide-y">
              {folder.messages.map((message) => (
                <div key={message.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <h3 className="font-medium">{message.name}</h3>
                    <div className="text-sm text-gray-500">
                      <span>Created: {format(new Date(message.createdAt), 'MMM d, yyyy')}</span>
                      <span className="mx-2">•</span>
                      <span>Last modified: {format(new Date(message.updatedAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditMessage(message)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleMoveMessage(message)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                      title="Move"
                    >
                      <ArrowRightIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(message)}
                      className="p-2 text-gray-500 hover:text-red-500"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Message</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
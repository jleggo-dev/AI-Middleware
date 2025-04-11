/**
 * Home Page
 * 
 * This is the landing page of the application that serves as the entry point for users.
 * It provides navigation to the login and registration pages.
 * 
 * The page is intentionally simple, focusing on directing users to either sign in
 * if they have an account or create a new account if they don't.
 * 
 * Features:
 * - Clean, modern UI
 * - Direct links to login and registration pages
 * - Responsive design for various screen sizes
 * 
 * Dependencies:
 * - next/link: For client-side navigation between pages
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import FolderManagementModal from '@/components/FolderManagementModal/FolderManagementModal'

export default function Home() {
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Message Management System
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Create Message Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Create Message
              </h2>
              <p className="text-gray-600 mb-6">
                Create a new message from scratch or from a template
              </p>
              <Link
                href="/create-message"
                className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300"
              >
                Create Message
              </Link>
            </div>

            {/* Manage Templates Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Manage Templates
              </h2>
              <p className="text-gray-600 mb-6">
                Create and manage message templates for different file types
              </p>
              <Link
                href="/templates"
                className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300"
              >
                Manage Templates
              </Link>
            </div>
          </div>

          {/* Manage Folders Button */}
          <div className="mt-8">
            <button
              onClick={() => setIsFolderModalOpen(true)}
              className="inline-block bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-300"
            >
              Manage Folders
            </button>
          </div>
        </div>
      </div>

      {/* Folder Management Modal */}
      <FolderManagementModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
      />
    </main>
  )
}

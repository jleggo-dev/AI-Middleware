/**
 * AIs Page
 * 
 * This page displays the user's AI agents and provides AI management functionality.
 * It is a protected page that requires authentication to access.
 * 
 * Features:
 * - List of user's AI agents (placeholder)
 * - Create new AI option (placeholder)
 * - AI management options (placeholder)
 */

export default function AIsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="py-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Agents</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create and manage your AI agents.
        </p>
      </div>
      
      {/* Placeholder content */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="text-center py-10">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No AI agents</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new AI agent.
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create AI Agent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
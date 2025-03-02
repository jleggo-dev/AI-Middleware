/**
 * Jobs Page
 * 
 * This page displays the user's jobs and provides job management functionality.
 * It is a protected page that requires authentication to access.
 * 
 * Features:
 * - List of user's jobs (placeholder)
 * - Create new job option (placeholder)
 * - Job management options (placeholder)
 */

export default function JobsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="py-6">
        <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track and manage your processing jobs.
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new processing job.
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
                Create Job
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
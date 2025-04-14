/**
 * Dashboard Page
 * 
 * This is a protected page that displays user information and provides
 * access to authenticated features. It requires the user to be logged in
 * to access. If a user is not authenticated, they are redirected to the login page.
 * 
 * Features:
 * - Authentication check with redirect to login if not authenticated
 * - User information display
 * - Summary of application activity
 * 
 * Dependencies:
 * - @/contexts/AuthContext: For authentication state
 * - next/navigation: For routing/redirection
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

// Loading component for Suspense fallback
function DashboardLoading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="text-xl">Loading dashboard...</div>
    </div>
  );
}

// Main Dashboard component
function DashboardContent() {
  // Get authentication data and functions from context
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // On mount, mark the page as loaded after a short delay
  // This helps prevent unwanted redirects during initial rendering
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasLoaded(true);
    }, 1000); // Wait 1 second to ensure auth state has stabilized
    
    return () => clearTimeout(timer);
  }, []);
  
  // Redirect to login page if not authenticated and page has loaded
  useEffect(() => {
    if (hasLoaded && !isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router, hasLoaded]);
  
  // Show loading state while checking authentication
  if (isLoading || !hasLoaded) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  // Return null during redirect (prevents flash of content)
  if (!user) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="py-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Here&apos;s what&apos;s happening with your account
        </p>
      </div>
      
      {/* Dashboard content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User info card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">User ID</p>
              <p className="text-sm text-gray-900">{user.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Last Sign In</p>
              <p className="text-sm text-gray-900">
                {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email Verified</p>
              <p className="text-sm text-gray-900">
                {user.email_confirmed_at ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Stats card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Activity</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-indigo-600">0</p>
              <p className="text-sm text-gray-500">Files</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-indigo-600">0</p>
              <p className="text-sm text-gray-500">Messages</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-indigo-600">0</p>
              <p className="text-sm text-gray-500">AIs</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-indigo-600">0</p>
              <p className="text-sm text-gray-500">Jobs</p>
            </div>
          </div>
        </div>
        
        {/* Quick actions card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <a href="/files/upload" className="block text-sm text-indigo-600 hover:text-indigo-500">
              Upload a new file
            </a>
            <a href="/messages/new" className="block text-sm text-indigo-600 hover:text-indigo-500">
              Send a message
            </a>
            <a href="/ais/create" className="block text-sm text-indigo-600 hover:text-indigo-500">
              Create new AI
            </a>
            <a href="/jobs/new" className="block text-sm text-indigo-600 hover:text-indigo-500">
              Create a job
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
} 
/**
 * Dashboard Page
 * 
 * This is a protected page that displays user information and provides
 * access to authenticated features. It requires the user to be logged in
 * to access. If a user is not authenticated, they are redirected to the login page.
 * 
 * Features:
 * - Authentication check with redirect to login if not authenticated
 * - Loading state display
 * - User information display
 * - Sign out functionality
 * - Suspense boundary for client-side navigation
 * 
 * Dependencies:
 * - @/contexts/AuthContext: For authentication state and sign out functionality
 * - next/navigation: For routing/redirection
 * - React useEffect: For handling redirect logic
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

// Loading component for Suspense fallback
function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-xl">Loading dashboard...</div>
    </div>
  );
}

// Main Dashboard component
function DashboardContent() {
  // Get authentication data and functions from context
  const { user, isLoading, signOut } = useAuth();
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
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  // Return null during redirect (prevents flash of content)
  if (!user) {
    return null; // Will redirect in the useEffect
  }
  
  /**
   * Handle user sign out
   * Signs out the user and redirects to login page
   */
  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };
  
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header with title and sign out button */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign Out
          </button>
        </div>
      </header>
      
      {/* Main content area */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-6">
            {/* Welcome message */}
            <h2 className="text-xl font-semibold mb-4">Welcome, {user.email}</h2>
            <p className="text-gray-600">
              This is your protected dashboard page. You can only see this content when you&apos;re logged in.
            </p>
            
            {/* User account information */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Your Account Details:</h3>
              <div className="bg-white p-4 rounded shadow">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Last Sign In:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
                <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
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
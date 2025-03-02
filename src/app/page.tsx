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

import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      {/* Main content area */}
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 text-center">
        {/* Page heading */}
        <h1 className="text-5xl font-bold mb-6">
          Welcome to <span className="text-indigo-600">AI Middleware</span>
        </h1>
        
        {/* Subheading */}
        <p className="text-xl mb-8">
          Your next-generation platform powered by Next.js, Tailwind CSS, and Supabase
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-around max-w-md mt-6">
          {/* Sign in button */}
          <Link
            href="/login"
            className="p-4 w-40 text-center bg-indigo-600 rounded-md font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </Link>
          
          {/* Create account button */}
          <Link
            href="/register"
            className="p-4 w-40 text-center bg-white border border-indigo-600 rounded-md font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="flex items-center justify-center w-full h-24 border-t">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} AI Middleware. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

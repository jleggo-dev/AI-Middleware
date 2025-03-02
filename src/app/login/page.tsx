/**
 * Login Page
 * 
 * This page renders the login form component and provides a container for the login functionality.
 * It serves as the entry point for users who need to authenticate to access protected routes.
 * 
 * The page is server-rendered but contains a client component (LoginForm) that handles
 * the interactive login functionality.
 * 
 * Features:
 * - Suspense boundary for client components that use hooks like useSearchParams
 * - Loading fallback for better user experience
 * 
 * Dependencies:
 * - @/components/LoginForm: Client component that handles login form logic and UI
 * - react: For Suspense boundary
 */

import LoginForm from '@/components/LoginForm';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg text-center">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
} 
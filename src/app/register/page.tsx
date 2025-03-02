/**
 * Registration Page
 * 
 * This page renders the registration form component and provides a container for the sign-up functionality.
 * It serves as the entry point for new users who want to create an account.
 * 
 * The page is server-rendered but contains a client component (RegisterForm) that handles
 * the interactive registration functionality.
 * 
 * Features:
 * - Suspense boundary for client components
 * - Loading fallback for better user experience
 * 
 * Dependencies:
 * - @/components/RegisterForm: Client component that handles registration form logic and UI
 * - react: For Suspense boundary
 */

import RegisterForm from '@/components/RegisterForm';
import { Suspense } from 'react';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg text-center">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
} 
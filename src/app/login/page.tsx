/**
 * Login Page
 * 
 * This page renders the login form component and provides a container for the login functionality.
 * It serves as the entry point for users who need to authenticate to access protected routes.
 * 
 * The page is server-rendered but contains a client component (LoginForm) that handles
 * the interactive login functionality.
 * 
 * Dependencies:
 * - @/components/LoginForm: Client component that handles login form logic and UI
 */

import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
} 
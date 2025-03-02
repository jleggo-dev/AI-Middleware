/**
 * Registration Page
 * 
 * This page renders the registration form component and provides a container for the sign-up functionality.
 * It serves as the entry point for new users who want to create an account.
 * 
 * The page is server-rendered but contains a client component (RegisterForm) that handles
 * the interactive registration functionality.
 * 
 * Dependencies:
 * - @/components/RegisterForm: Client component that handles registration form logic and UI
 */

import RegisterForm from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm />
    </div>
  );
} 
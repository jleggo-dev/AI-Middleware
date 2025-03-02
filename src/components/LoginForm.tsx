/**
 * Login Form Component
 * 
 * This component renders a form that allows users to sign in with their email and password.
 * It handles form validation, error display, and submission to the authentication service.
 * Upon successful login, it redirects the user to the dashboard.
 * 
 * Features:
 * - Email and password validation
 * - Error handling and display
 * - Loading state management
 * - Remember me functionality
 * - Forgot password link
 * - Navigation to registration page
 * 
 * Dependencies:
 * - react-hook-form: For form state management and validation
 * - @/contexts/AuthContext: For authentication functionality
 * - next/navigation: For routing after successful login
 * - next/link: For navigation links
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Form data type definition
type FormData = {
  email: string;
  password: string;
};

export default function LoginForm() {
  // Get authentication functions from context
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Component state
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  
  /**
   * Form submission handler
   * Attempts to sign in the user with provided credentials
   */
  const onSubmit = async (data: FormData) => {
    try {
      // Set loading state and clear previous errors
      setIsLoading(true);
      setError(null);
      
      // Attempt to sign in
      const { error: signInError } = await signIn(data.email, data.password);
      
      // Handle authentication errors
      if (signInError) {
        setError(signInError.message);
        return;
      }
      
      // Check if there's a redirect URL in the query parameters
      const redirectTo = searchParams.get('redirectTo');
      
      // On successful login, redirect to the requested page or dashboard
      router.push(redirectTo || '/dashboard');
    } catch (err) {
      // Handle unexpected errors
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">Sign In</h1>
        <p className="mt-2 text-gray-600">Welcome back! Please sign in to your account.</p>
      </div>
      
      {/* Error alert */}
      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}
      
      {/* Login form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="mt-1">
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>
        
        {/* Password field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
        </div>
        
        {/* Remember me and forgot password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="remember-me" className="block ml-2 text-sm text-gray-900">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </a>
          </div>
        </div>
        
        {/* Submit button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </form>
      
      {/* Sign up link */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
} 
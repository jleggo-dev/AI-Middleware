/**
 * Registration Form Component
 * 
 * This component provides a form for new users to register (sign up) with email and password.
 * It handles form validation, error display, and submission to the authentication service.
 * After successful registration, it displays a success message with instructions for email confirmation.
 * 
 * Features:
 * - Email and password validation
 * - Password confirmation/matching
 * - Error handling and display
 * - Loading state management
 * - Success state display
 * - Navigation back to login page
 * 
 * Dependencies:
 * - react-hook-form: For form state management and validation
 * - @/contexts/AuthContext: For authentication functionality
 * - next/link: For navigation links
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

// Form data type definition
type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterForm() {
  // Get authentication functions from context
  const { signUp } = useAuth();
  
  // Component state
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<string>('');
  
  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();
  
  // Watch password field for confirmation matching
  const password = watch('password');
  
  /**
   * Form submission handler
   * Attempts to register a new user with provided credentials
   */
  const onSubmit = async (data: FormData) => {
    try {
      // Set loading state and clear previous errors
      setIsLoading(true);
      setError(null);
      
      // Attempt to sign up
      const { error: signUpError, data: signUpData } = await signUp(data.email, data.password);
      
      // Handle registration errors
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      
      // Set success message from API response
      if (signUpData) {
        setMessage(signUpData.message || 'Registration successful!');
      } else {
        setMessage('Registration successful!');
      }
      
      // Show success message after successful registration
      setSuccess(true);
    } catch (err) {
      // Handle unexpected errors
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };
  
  // Render success message after registration
  if (success) {
    return (
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600">Registration Successful!</h1>
          <p className="mt-2 text-gray-600">
            {message}
          </p>
        </div>
        <div className="text-center mt-6">
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Return to login
          </Link>
        </div>
      </div>
    );
  }
  
  // Render registration form
  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create an Account</h1>
        <p className="mt-2 text-gray-600">Sign up to get started with our platform.</p>
      </div>
      
      {/* Error alert */}
      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}
      
      {/* Registration form */}
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
              autoComplete="new-password"
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
        
        {/* Confirm Password field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="mt-1">
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>
        
        {/* Submit button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </button>
        </div>
      </form>
      
      {/* Sign in link */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
} 
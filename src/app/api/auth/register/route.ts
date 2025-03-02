/**
 * Register API Route
 * 
 * This API route handles user registration:
 * - POST: Registers a new user with email and password
 * 
 * The route uses Supabase's server-side auth methods and sets secure HTTP-only cookies
 * for authentication token storage (if auto-sign-in is enabled).
 * 
 * Security features:
 * - Server-side user creation
 * - Input validation
 * - Proper error handling and status codes
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body to get email and password
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' }, 
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' }, 
        { status: 400 }
      );
    }

    // Create a Supabase client using cookies
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the site URL from environment variables or construct it from the request
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
      `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`;
    
    // Attempt to create a new user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Redirect to our auth callback handler after email verification
        emailRedirectTo: `${siteUrl}/auth/callback`,
      }
    });
    
    // Handle registration errors
    if (error) {
      console.error('Registration error:', error.message);
      return NextResponse.json(
        { error: error.message }, 
        { status: 400 }
      );
    }
    
    // Check if email confirmation is required
    const isEmailConfirmationRequired = data?.user?.identities?.length === 0;
    
    // Return success response with appropriate message
    return NextResponse.json({
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        emailConfirmed: !isEmailConfirmationRequired
      } : null,
      message: isEmailConfirmationRequired 
        ? 'Registration successful. Please check your email to confirm your account.' 
        : 'Registration successful.'
    });
  } catch (error) {
    console.error('Unexpected error in register route:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 
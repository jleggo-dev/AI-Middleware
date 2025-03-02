/**
 * Login API Route
 * 
 * This API route handles user authentication:
 * - POST: Authenticates a user with email and password
 * 
 * The route uses Supabase's server-side auth methods and sets secure HTTP-only cookies
 * for authentication token storage. This approach prevents client-side JavaScript from
 * accessing the authentication tokens, enhancing security.
 * 
 * Security features:
 * - Server-side token generation and storage
 * - HTTP-only cookies for token storage
 * - Secure cookies (HTTPS only in production)
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

    // Create a Supabase client using cookies
    const supabase = createRouteHandlerClient({ cookies });
    
    // Attempt to sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Handle authentication errors
    if (error) {
      console.error('Login error:', error.message);
      return NextResponse.json(
        { error: error.message }, 
        { status: 401 }
      );
    }
    
    // Return user data (excluding sensitive information)
    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata,
        last_sign_in_at: data.user.last_sign_in_at
      }
    });
  } catch (error) {
    console.error('Unexpected error in login route:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 
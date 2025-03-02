/**
 * Authentication Callback Route
 * 
 * This route handles callback requests from Supabase authentication operations
 * such as email verification, password resets, and third-party OAuth logins.
 * 
 * It exchanges the auth code for a session and redirects the user to the appropriate page.
 * 
 * Security features:
 * - Secure HTTP-only cookie storage for authentication tokens
 * - No exposure of tokens to client-side JavaScript
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Default redirect destination after successful authentication
const DEFAULT_REDIRECT = '/dashboard';

export async function GET(request: NextRequest) {
  try {
    // Get the auth code from the URL
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    
    // If no code is provided, redirect to login
    if (!code) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Create a Supabase client 
    const supabase = createRouteHandlerClient({ cookies });
    
    // Exchange the auth code for a session
    // This automatically sets the session in the cookies
    await supabase.auth.exchangeCodeForSession(code);
    
    // Get redirect URL from query parameters or use default
    const redirectTo = requestUrl.searchParams.get('redirectTo') || DEFAULT_REDIRECT;
    
    // Redirect to the appropriate page
    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (error) {
    console.error('Error in auth callback:', error);
    
    // Redirect to login page with error if something goes wrong
    return NextResponse.redirect(
      new URL('/login?error=Authentication%20failed', request.url)
    );
  }
} 
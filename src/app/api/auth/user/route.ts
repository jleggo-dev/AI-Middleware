/**
 * User API Route
 * 
 * This API route provides access to the current authenticated user's data:
 * - GET: Returns detailed user information for the authenticated user
 * 
 * The route requires authentication and checks the user's session before
 * returning any data. It is intended for use in protected routes.
 * 
 * Security features:
 * - Session validation before returning user data
 * - Filtering of sensitive information
 * - Proper error handling and status codes
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET() {
  try {
    // Create a Supabase client using the route handler with cookies
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get the user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Check if the user is authenticated
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }
    
    // Get additional user data from Supabase if needed
    // For example, you could fetch user profile data from a 'profiles' table
    
    // For demonstration, we'll just return the user data from the session
    // In a real application, you might join this with additional user data from your database
    
    return NextResponse.json({
      id: session.user.id,
      email: session.user.email,
      emailVerified: session.user.email_confirmed_at !== null,
      lastSignInAt: session.user.last_sign_in_at,
      createdAt: session.user.created_at,
      userMetadata: session.user.user_metadata,
      // Don't include sensitive authentication information
    });
  } catch (error) {
    console.error('Unexpected error in user route:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 
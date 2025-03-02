/**
 * Session API Route
 * 
 * This API route handles session-related operations:
 * - GET: Returns the current user session if authenticated
 * 
 * The route uses Supabase's server-side auth methods and manages secure HTTP-only cookies
 * for authentication token storage.
 * 
 * Security features:
 * - Server-side authentication token validation
 * - No exposure of sensitive tokens to client-side JavaScript
 * - Proper error handling and status codes
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET() {
  try {
    // Create a Supabase client using cookies
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the session from Supabase (this validates the token in the cookie)
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // Handle authentication errors
    if (error) {
      console.error('Session error:', error.message);
      return NextResponse.json(
        { error: 'Failed to get session' }, 
        { status: 401 }
      );
    }
    
    // If no session exists, return 401 Unauthorized
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }
    
    // Return the session data (excluding sensitive information)
    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        user_metadata: session.user.user_metadata,
        last_sign_in_at: session.user.last_sign_in_at
      },
      expires_at: session.expires_at
    });
  } catch (error) {
    console.error('Unexpected error in session route:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 
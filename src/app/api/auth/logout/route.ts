/**
 * Logout API Route
 * 
 * This API route handles user logout:
 * - POST: Signs out the user and clears authentication cookies
 * 
 * The route uses Supabase's server-side auth methods to invalidate the session
 * and clear the authentication cookies from the browser.
 * 
 * Security features:
 * - Server-side session invalidation
 * - Complete cookie cleanup
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST() {
  try {
    // Create a Supabase client using cookies
    const supabase = createRouteHandlerClient({ cookies });
    
    // Sign out the user - this will clear the session and remove the cookies
    const { error } = await supabase.auth.signOut();
    
    // Handle sign out errors
    if (error) {
      console.error('Logout error:', error.message);
      return NextResponse.json(
        { error: 'Failed to sign out' }, 
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({ message: 'Successfully signed out' });
  } catch (error) {
    console.error('Unexpected error in logout route:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 
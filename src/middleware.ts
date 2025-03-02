/**
 * Authentication Middleware
 * 
 * This middleware runs on every request to routes that match the middleware config.
 * It checks if the user is authenticated for protected routes and redirects to the
 * login page if they are not.
 * 
 * Features:
 * - Protects specified routes against unauthorized access
 * - Validates authentication with server-side cookie verification
 * - Handles route protection without exposing tokens to client JavaScript
 * 
 * Dependencies:
 * - next/server: For middleware functionality
 * - @supabase/auth-helpers-nextjs: For server-side authentication
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/settings', '/files', '/messages', '/ais', '/jobs'];

// Function to check if a route is protected
const isProtectedRoute = (path: string): boolean => {
  return PROTECTED_ROUTES.some(route => path.startsWith(route));
};

// Function to check if a route is explicitly defined as public
// This is used in the middleware function to improve readability
const isPublicAuthRoute = (path: string): boolean => {
  return path === '/login' || path === '/register';
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Skip middleware for API routes and static assets
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.includes('.') // Static files like images, etc.
  ) {
    return res;
  }

  // Skip auth callback route
  if (pathname.startsWith('/auth/callback')) {
    return res;
  }

  // Create Supabase client for auth operations
  const supabase = createMiddlewareClient({ req, res });
  
  // Check if the user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthenticated = !!session;

  // Handle protected routes - redirect to login if not authenticated
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const redirectUrl = new URL('/login', req.url);
    // Save the original URL as a query parameter for redirection after login
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users from public auth pages to dashboard
  if (isAuthenticated && isPublicAuthRoute(pathname)) {
    const redirectUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Allow the request to proceed
  return res;
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 
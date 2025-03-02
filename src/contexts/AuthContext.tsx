/**
 * Authentication Context Provider
 * 
 * This file implements a React Context for managing authentication state throughout the application.
 * It provides authentication-related functionality including:
 * - User authentication state management
 * - Sign in with email/password via server API
 * - Sign up (registration) via server API
 * - Sign out via server API
 * - Session management
 * 
 * Instead of using Supabase directly in the client, this context calls our
 * backend API routes for all authentication operations, enhancing security by
 * keeping tokens in HTTP-only cookies.
 * 
 * Dependencies:
 * - React (useState, useEffect, createContext, useContext)
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

// Define a type for user metadata to avoid using 'any'
type UserMetadata = {
  [key: string]: string | number | boolean | null | undefined;
};

// Types for user and session
export interface User {
  id: string;
  email: string | null;
  user_metadata?: UserMetadata;
  last_sign_in_at?: string;
  created_at?: string;
  emailVerified?: boolean;
}

export interface Session {
  user: User;
  expires_at?: number;
}

/**
 * Type definition for the authentication context
 * Defines the shape of the context value and available methods
 */
type AuthContextType = {
  user: User | null;             // Current authenticated user or null if not authenticated
  session: Session | null;       // Current session data or null if no active session
  isLoading: boolean;            // Loading state during authentication operations
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: { user: User | null } | null;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data: { user: User | null; message: string } | null;
  }>;
  signOut: () => Promise<void>;  // Sign out the current user
  refreshSession: () => Promise<void>; // Refresh the session data
};

// Create the context with undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * 
 * Manages authentication state and provides auth methods to all child components
 * through React Context.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State for authentication data
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Flag to prevent repeated fetch attempts if the session endpoint is failing
  const hasAttemptedFetch = useRef(false);
  const [fetchFailed, setFetchFailed] = useState(false);

  /**
   * Fetch the current session from the server
   * This uses the /api/auth/session endpoint
   */
  const fetchSession = useCallback(async () => {
    // If the fetch has already failed, don't try again to prevent infinite loops
    if (fetchFailed) {
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'X-Request-Time': Date.now().toString()
        }
      });
      
      if (response.ok) {
        const sessionData = await response.json();
        if (sessionData && sessionData.user) {
          setSession(sessionData);
          setUser(sessionData.user);
        } else {
          setSession(null);
          setUser(null);
        }
      } else {
        // If no session or error, clear the user state
        setSession(null);
        setUser(null);
        console.log('No active session found, status:', response.status);
        
        // If this is not a 401 (which is expected for unauthenticated users),
        // mark fetch as failed to prevent infinite loops
        if (response.status !== 401) {
          setFetchFailed(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
      setSession(null);
      setUser(null);
      setFetchFailed(true);
    } finally {
      hasAttemptedFetch.current = true;
      setIsLoading(false);
    }
  }, [fetchFailed]);

  // Fetch session on initial load, but only once
  useEffect(() => {
    if (!hasAttemptedFetch.current) {
      fetchSession();
    }
  }, [fetchSession]);

  /**
   * Refresh the session data
   * Used to update the authentication state when needed
   */
  const refreshSession = async () => {
    // Reset the fetch failed flag when explicitly requesting a refresh
    setFetchFailed(false);
    setIsLoading(true);
    await fetchSession();
  };

  /**
   * Sign in with email and password using the server API
   * @param email User's email address
   * @param password User's password
   * @returns Promise resolving to authentication result
   */
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { error: new Error(data.error || 'Failed to sign in'), data: null };
      }
      
      // After successful login, reset fetch failure flag and fetch the latest session
      setFetchFailed(false);
      
      // Set the user directly from the login response to avoid an extra API call
      if (data && data.user) {
        setUser(data.user);
        setSession({ user: data.user });
      }
      
      return { error: null, data };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as Error, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign up a new user with email and password using the server API
   * @param email User's email address
   * @param password User's password
   * @returns Promise resolving to registration result
   */
  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { error: new Error(data.error || 'Failed to sign up'), data: null };
      }
      
      // Reset fetch failure flag in case a new login session is created
      setFetchFailed(false);
      
      // If the user is auto-logged in after registration, set the user directly
      if (data && data.user && !data.user.emailConfirmed) {
        setUser(data.user);
        setSession({ user: data.user });
      }
      
      return { error: null, data };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as Error, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out the current user using the server API
   */
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      // Clear user and session state
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Context value containing auth state and methods
  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use the auth context
 * Ensures the hook is used within an AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
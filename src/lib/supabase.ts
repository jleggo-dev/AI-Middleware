/**
 * Supabase Client Configuration
 * 
 * This file initializes and exports the Supabase client for authentication and database operations.
 * It provides two clients:
 * 1. A standard client with anonymous permissions for client-side operations
 * 2. A service role client with elevated permissions for server-side operations
 * 
 * Environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL: The URL of your Supabase project
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: The anonymous API key for client-side operations
 * - SUPABASE_SERVICE_ROLE_KEY: The service role key for server-side operations (with elevated permissions)
 * 
 * Dependencies:
 * - @supabase/supabase-js: Supabase JavaScript client library
 */

import { createClient } from '@supabase/supabase-js';

// Create a standard Supabase client for client-side operations
// This uses the anonymous key which has restricted permissions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Creates a Supabase client with service role permissions for server-side operations
 * This client has elevated permissions and should ONLY be used in server-side code,
 * never exposed to the client.
 * 
 * Options disable token persistence since this is meant for single-request server operations
 */
export const getServiceRoleClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}; 
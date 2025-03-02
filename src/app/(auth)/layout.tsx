/**
 * Authenticated Layout
 * 
 * This layout is used for all authenticated routes and includes the navigation bar.
 * It provides a consistent layout structure for pages that require authentication.
 * 
 * Features:
 * - Includes the global navigation bar
 * - Provides consistent padding and structure
 * - Only renders for authenticated users
 * 
 * Dependencies:
 * - @/components/Nav: For the navigation bar
 */

import Nav from '@/components/Nav';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="py-4">
        {children}
      </div>
    </div>
  );
} 
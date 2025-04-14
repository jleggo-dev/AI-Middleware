/**
 * Root Layout
 * 
 * This is the root layout component that wraps all pages in the application.
 * It provides common layout elements and context providers that are shared across all pages.
 * 
 * Features:
 * - Font loading and configuration using next/font
 * - Global CSS import
 * - Auth provider context that enables authentication across the application
 * - HTML structure with language attribute and body styling
 * 
 * Dependencies:
 * - next/font/google: For loading and configuring Google Fonts
 * - @/contexts/AuthContext: Authentication context provider
 * - Global CSS from ./globals.css
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

// Load Inter font with Latin subset
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Metadata for the application (used for SEO and browser tab information)
export const metadata: Metadata = {
  title: "AI Middleware",
  description: "Next.js application with Supabase authentication",
};

/**
 * Root layout component that wraps all pages
 * Provides fonts, styling, and auth context
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

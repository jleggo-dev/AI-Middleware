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
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

// Load Geist Sans font with Latin subset
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Load Geist Mono font with Latin subset
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Wrap all content with AuthProvider to enable authentication */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

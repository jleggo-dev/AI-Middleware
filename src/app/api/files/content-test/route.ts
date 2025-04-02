import { NextResponse } from 'next/server';

// Simple test route to check type compatibility
export async function GET() {
  return NextResponse.json({ message: "Content test API working" });
} 
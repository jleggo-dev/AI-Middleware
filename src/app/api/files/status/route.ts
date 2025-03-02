/**
 * File Status Update API Route
 * 
 * PATCH: Updates the status of a file in Supabase
 * 
 * This endpoint:
 * 1. Verifies user authentication
 * 2. Updates file status in Supabase
 * 3. Returns the updated file information
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function PATCH(request: NextRequest) {
  try {
    // Create a Supabase client using cookies for authentication
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Check if the user is authenticated
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { fileId, status, error_message } = body;
    
    if (!fileId || !status) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'File ID and status are required' 
        },
        { status: 400 }
      );
    }
    
    // Validate status
    const validStatuses = ['uploading', 'uploaded', 'failed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid status',
          message: `Status must be one of: ${validStatuses.join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // Update file status in Supabase
    const updateData: { status: string; error_message?: string | null } = { status };
    if (error_message) {
      updateData.error_message = error_message;
    } else if (status === 'uploaded') {
      // Clear error message when status is successful
      updateData.error_message = null;
    }
    
    const { data: fileData, error: updateError } = await supabase
      .from('files')
      .update(updateData)
      .eq('id', fileId)
      .eq('user_id', session.user.id) // Ensure user owns the file
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating file status:', updateError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update file status',
          message: updateError.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      file: fileData
    });
  } catch (error) {
    console.error('Error updating file status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update file status',
        message: (error as Error).message 
      },
      { status: 500 }
    );
  }
} 
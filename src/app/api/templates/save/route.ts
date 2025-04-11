/**
 * Template Save API Route
 * 
 * POST: Saves a template to the database with proper validation
 * - Uses Zod for schema validation
 * - Implements UPSERT logic (creates or updates templates)
 * - Validates user authentication and ownership
 * - Handles folder relationships
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { z } from 'zod'
import { templateSchema } from '@/schemas/template'

/**
 * Saves a template to the database
 * Uses UPSERT logic - will create a new template or update an existing one if ID is provided
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const requestData = await request.json()
    
    // Initialize Supabase client with cookies
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Verify user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required',
          message: 'You must be logged in to save templates'
        },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // Validate template data with Zod schema
    let templateData
    try {
      templateData = templateSchema.parse(requestData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Validation failed',
            message: 'Invalid template data',
            details: error.errors
          },
          { status: 400 }
        )
      }
      throw error
    }
    
    // Check if folder exists (if provided)
    if (templateData.folderId) {
      const { data: folder, error: folderError } = await supabase
        .from('template_folders')
        .select('id')
        .eq('id', templateData.folderId)
        .eq('user_id', userId)
        .single()
      
      if (folderError || !folder) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Folder not found',
            message: 'The specified folder does not exist or you do not have access to it'
          },
          { status: 404 }
        )
      }
    }
    
    // Prepare data for Supabase
    const { id, folderId, ...rest } = templateData
    
    // Create or update template
    const { data, error } = await supabase
      .from('message_templates')
      .upsert({
        id: id || undefined, // Use existing ID or let Supabase generate one
        user_id: userId,
        folder_id: folderId || null,
        ...rest,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error saving template:', error)
      return NextResponse.json(
        { 
          success: false,
          error: 'Database error',
          message: 'Failed to save template',
          details: error.message
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      templateId: data.id,
      message: id ? 'Template updated successfully' : 'Template created successfully'
    })
  } catch (error) {
    console.error('Error in template save API:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 
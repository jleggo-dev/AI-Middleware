import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { z } from 'zod'

// Schema for folder creation
const createFolderSchema = z.object({
  name: z.string().min(3).max(100), // Match the database check constraint
  parentFolderId: z.string().uuid().nullable().optional()
})

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Verify user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required',
          message: 'You must be logged in to create folders'
        },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // Parse and validate request body
    const requestData = await request.json()
    const validatedData = createFolderSchema.parse(requestData)
    
    // If parentFolderId is provided, verify it exists and belongs to the user
    if (validatedData.parentFolderId) {
      const { data: parentFolder, error: parentError } = await supabase
        .from('template_folders')
        .select('id')
        .eq('id', validatedData.parentFolderId)
        .eq('user_id', userId)
        .single()
      
      if (parentError || !parentFolder) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Parent folder not found',
            message: 'The specified parent folder does not exist or you do not have access to it'
          },
          { status: 404 }
        )
      }
    }
    
    // Create the folder
    const { data, error } = await supabase
      .from('template_folders')
      .insert({
        name: validatedData.name,
        user_id: userId,
        parent_folder_id: validatedData.parentFolderId || null
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating folder:', error)
      return NextResponse.json(
        { 
          success: false,
          error: 'Database error',
          message: 'Failed to create folder',
          details: error.message
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      folder: data,
      message: 'Folder created successfully'
    })
  } catch (error) {
    console.error('Error in folder creation API:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          message: 'Invalid folder data',
          details: error.errors
        },
        { status: 400 }
      )
    }
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

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Verify user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required',
          message: 'You must be logged in to view folders'
        },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // Get all folders for the user
    const { data: folders, error } = await supabase
      .from('template_folders')
      .select('*')
      .eq('user_id', userId)
      .order('name')
    
    if (error) {
      console.error('Error fetching folders:', error)
      return NextResponse.json(
        { 
          success: false,
          error: 'Database error',
          message: 'Failed to fetch folders',
          details: error.message
        },
        { status: 500 }
      )
    }
    
    // Organize folders into a tree structure
    const folderTree = buildFolderTree(folders)
    
    return NextResponse.json({
      success: true,
      folders: folderTree
    })
  } catch (error) {
    console.error('Error in folder fetch API:', error)
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

// Helper function to build folder tree
interface FolderNode {
  id: string
  name: string
  parent_folder_id: string | null
  children: FolderNode[]
  [key: string]: unknown
}

function buildFolderTree(folders: FolderNode[]): FolderNode[] {
  const folderMap = new Map<string, FolderNode>()
  const rootFolders: FolderNode[] = []
  
  // First pass: create map of all folders
  folders.forEach(folder => {
    folderMap.set(folder.id, {
      ...folder,
      children: []
    })
  })
  
  // Second pass: build tree structure
  folders.forEach(folder => {
    const folderNode = folderMap.get(folder.id)
    if (!folderNode) return

    if (folder.parent_folder_id) {
      const parent = folderMap.get(folder.parent_folder_id)
      if (parent) {
        parent.children.push(folderNode)
      }
    } else {
      rootFolders.push(folderNode)
    }
  })
  
  return rootFolders
} 
/**
 * Template Utilities
 * 
 * Provides functions for common template operations like:
 * - Saving templates to the database
 * - Managing template folders
 * - Template validation
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Template, templateSchema, TemplateSaveError, TemplateValidationError } from '@/schemas/template'
import { z } from 'zod'

// Initialize Supabase client
const supabase = createClientComponentClient()

/**
 * Saves a template to the database
 * 
 * @param template The template data to save
 * @returns The ID of the saved template
 * @throws TemplateValidationError if validation fails
 * @throws TemplateSaveError if database operation fails
 */
export async function saveTemplate(template: Template): Promise<string> {
  try {
    // Validate template data
    const validatedTemplate = templateSchema.parse(template)
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new TemplateSaveError('User not authenticated')
    }
    
    // Check if folder exists (if provided)
    if (validatedTemplate.folderId) {
      const { data: folder, error: folderError } = await supabase
        .from('template_folders')
        .select('id')
        .eq('id', validatedTemplate.folderId)
        .single()
      
      if (folderError || !folder) {
        throw new TemplateSaveError('Folder not found or access denied')
      }
    }
    
    // Extract data for database
    const { id, folderId, ...rest } = validatedTemplate
    
    // Create or update template
    const { data, error } = await supabase
      .from('message_templates')
      .upsert({
        id: id || undefined,
        user_id: user.id,
        folder_id: folderId || null,
        ...rest,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error saving template:', error)
      throw new TemplateSaveError(error.message)
    }
    
    return data.id
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new TemplateValidationError(error)
    }
    if (error instanceof TemplateSaveError) {
      throw error
    }
    throw new TemplateSaveError(error instanceof Error ? error.message : 'Unknown error')
  }
}

/**
 * Fetches a template by ID
 * 
 * @param templateId The ID of the template to fetch
 * @returns The template data or null if not found
 */
export async function getTemplate(templateId: string): Promise<Template | null> {
  const { data, error } = await supabase
    .from('message_templates')
    .select('*')
    .eq('id', templateId)
    .single()
  
  if (error || !data) {
    return null
  }
  
  // Transform database model to Template type
  return {
    id: data.id,
    name: data.name,
    description: data.description ?? undefined,
    type: data.type as 'csv' | 'txt',
    config: data.config,
    folderId: data.folder_id ?? undefined
  }
}

/**
 * Lists all templates for the current user
 * 
 * @param folderId Optional folder ID to filter by
 * @returns Array of templates
 */
export async function listTemplates(folderId?: string): Promise<Template[]> {
  let query = supabase
    .from('message_templates')
    .select('*')
    .order('updated_at', { ascending: false })
  
  if (folderId) {
    query = query.eq('folder_id', folderId)
  }
  
  const { data, error } = await query
  
  if (error || !data) {
    return []
  }
  
  // Transform database models to Template types
  return data.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description ?? undefined,
    type: item.type as 'csv' | 'txt',
    config: item.config,
    folderId: item.folder_id ?? undefined
  }))
} 
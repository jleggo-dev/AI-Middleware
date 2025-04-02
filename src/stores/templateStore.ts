/**
 * Template Store
 * 
 * Manages template state using Zustand.
 * Handles:
 * - Currently active template
 * - Template editing operations
 * - Saving templates to the database
 * - Loading template data
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { 
  Template, 
  TemplateConfig, 
  TemplateSaveError, 
  TemplateValidationError 
} from '@/schemas/template'
import { saveTemplate, getTemplate, listTemplates } from '@/lib/templates'

// Default template configuration
const DEFAULT_CONFIG: TemplateConfig = {
  type: 'csv',
  intro: '',
  columns: [],
  conclusion: '',
  validation: {
    rules: [],
    errorMessage: ''
  }
}

// Store state interface
interface TemplateState {
  // State
  templates: Template[]
  currentTemplate: Template | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setCurrentTemplate: (template: Template | null) => void
  createNewTemplate: (type: 'csv' | 'txt') => void
  updateTemplateName: (name: string) => void
  updateTemplateConfig: (config: Partial<TemplateConfig>) => void
  updateTemplateDescription: (description: string) => void
  setTemplateFolder: (folderId: string | null) => void
  saveCurrentTemplate: () => Promise<string | null>
  loadTemplate: (templateId: string) => Promise<void>
  loadTemplates: (folderId?: string) => Promise<void>
  clearError: () => void
}

// Create the Zustand store
export const useTemplateStore = create<TemplateState>()(
  devtools(
    (set, get) => ({
      // Initial state
      templates: [],
      currentTemplate: null,
      isLoading: false,
      error: null,
      
      // Set the current template
      setCurrentTemplate: (template) => set({ currentTemplate: template }),
      
      // Create a new template with default values
      createNewTemplate: (type) => set({
        currentTemplate: {
          name: 'New Template',
          type,
          config: {
            ...DEFAULT_CONFIG,
            type
          }
        }
      }),
      
      // Update the current template's name
      updateTemplateName: (name) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return
        
        set({
          currentTemplate: {
            ...currentTemplate,
            name
          }
        })
      },
      
      // Update the current template's description
      updateTemplateDescription: (description) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return
        
        set({
          currentTemplate: {
            ...currentTemplate,
            description
          }
        })
      },
      
      // Update the current template's config
      updateTemplateConfig: (config) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return
        
        set({
          currentTemplate: {
            ...currentTemplate,
            config: {
              ...currentTemplate.config,
              ...config
            }
          }
        })
      },
      
      // Set the template's folder
      setTemplateFolder: (folderId) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return
        
        set({
          currentTemplate: {
            ...currentTemplate,
            folderId: folderId
          }
        })
      },
      
      // Save the current template to the database
      saveCurrentTemplate: async () => {
        const { currentTemplate } = get()
        if (!currentTemplate) return null
        
        set({ isLoading: true, error: null })
        
        try {
          const templateId = await saveTemplate(currentTemplate)
          
          // Update the template ID in the store
          set({
            currentTemplate: {
              ...currentTemplate,
              id: templateId
            },
            isLoading: false
          })
          
          return templateId
        } catch (error) {
          let errorMessage = 'Failed to save template'
          
          if (error instanceof TemplateValidationError) {
            errorMessage = 'Template validation failed: ' + 
              error.errors.errors.map(e => e.message).join(', ')
          } else if (error instanceof TemplateSaveError) {
            errorMessage = error.message
          } else if (error instanceof Error) {
            errorMessage = error.message
          }
          
          set({ error: errorMessage, isLoading: false })
          return null
        }
      },
      
      // Load a specific template by ID
      loadTemplate: async (templateId) => {
        set({ isLoading: true, error: null })
        
        try {
          const template = await getTemplate(templateId)
          
          if (template) {
            set({ currentTemplate: template, isLoading: false })
          } else {
            set({ 
              error: 'Template not found',
              isLoading: false
            })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load template',
            isLoading: false
          })
        }
      },
      
      // Load all templates or templates in a specific folder
      loadTemplates: async (folderId) => {
        set({ isLoading: true, error: null })
        
        try {
          const templates = await listTemplates(folderId)
          set({ templates, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load templates',
            isLoading: false
          })
        }
      },
      
      // Clear any error messages
      clearError: () => set({ error: null })
    }),
    { name: 'template-store' }
  )
) 
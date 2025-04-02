'use client'

/**
 * Template Save Test Page
 * 
 * A simple interface for testing template saving functionality.
 * Allows:
 * - Creating new templates
 * - Editing template properties
 * - Saving templates to the database
 * - Loading existing templates
 */

import { useState, useEffect } from 'react'
import { useTemplateStore } from '@/stores/templateStore'

export default function TemplateSavePage() {
  const {
    currentTemplate,
    templates,
    isLoading,
    error,
    createNewTemplate,
    updateTemplateName,
    updateTemplateDescription,
    updateTemplateConfig,
    saveCurrentTemplate,
    loadTemplates,
    loadTemplate,
    clearError
  } = useTemplateStore()

  // Local state for form inputs
  const [introText, setIntroText] = useState('')
  const [conclusionText, setConclusionText] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [saveStatus, setSaveStatus] = useState('')

  // Load all templates on mount
  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  // Update local state when current template changes
  useEffect(() => {
    if (currentTemplate) {
      setTemplateName(currentTemplate.name)
      setTemplateDescription(currentTemplate.description || '')
      setIntroText(currentTemplate.config.intro)
      setConclusionText(currentTemplate.config.conclusion)
    }
  }, [currentTemplate])

  // Handle template saving
  const handleSave = async () => {
    clearError()
    setSaveStatus('')
    
    // Apply current form values to the template
    updateTemplateName(templateName)
    updateTemplateDescription(templateDescription)
    updateTemplateConfig({
      intro: introText,
      conclusion: conclusionText
    })
    
    // Save to database
    const templateId = await saveCurrentTemplate()
    
    if (templateId) {
      setSaveStatus(`Template saved successfully with ID: ${templateId}`)
      
      // Reload templates list
      loadTemplates()
    }
  }

  // Create a new template
  const handleCreateNew = (type: 'csv' | 'txt') => {
    clearError()
    setSaveStatus('')
    createNewTemplate(type)
  }

  // Load an existing template
  const handleLoadTemplate = (templateId: string) => {
    clearError()
    setSaveStatus('')
    loadTemplate(templateId)
  }

  // Add a sample column
  const handleAddColumn = () => {
    if (!currentTemplate) return
    
    const newColumns = [
      ...(currentTemplate.config.columns || []),
      {
        name: `Column ${currentTemplate.config.columns.length + 1}`,
        preface: 'Value: ',
        closing: '.'
      }
    ]
    
    updateTemplateConfig({
      columns: newColumns
    })
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Template Save Test</h1>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Save status */}
      {saveStatus && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {saveStatus}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Template List */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-bold mb-2">Templates</h2>
          {isLoading && <p>Loading templates...</p>}
          
          {templates.length === 0 && !isLoading ? (
            <p className="text-gray-500">No templates found</p>
          ) : (
            <ul className="space-y-2">
              {templates.map(template => (
                <li key={template.id} className="border-b pb-2">
                  <button
                    onClick={() => handleLoadTemplate(template.id!)}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {template.name}
                  </button>
                  <p className="text-sm text-gray-500">
                    {template.type} - {template.description || 'No description'}
                  </p>
                </li>
              ))}
            </ul>
          )}
          
          <div className="mt-4 space-x-2">
            <button
              onClick={() => handleCreateNew('csv')}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              New CSV Template
            </button>
            <button
              onClick={() => handleCreateNew('txt')}
              className="px-3 py-1 bg-green-500 text-white rounded"
            >
              New Text Template
            </button>
          </div>
        </div>
        
        {/* Template Editor */}
        <div className="border rounded-lg p-4 md:col-span-2">
          <h2 className="text-lg font-bold mb-2">Editor</h2>
          
          {!currentTemplate ? (
            <p className="text-gray-500">Select a template or create a new one</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Template Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Template Name"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={templateDescription}
                  onChange={e => setTemplateDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Description"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Introduction Text</label>
                <textarea
                  value={introText}
                  onChange={e => setIntroText(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                  placeholder="Introduction text..."
                ></textarea>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-gray-700">Columns</label>
                  <button
                    onClick={handleAddColumn}
                    className="text-sm text-blue-500"
                  >
                    + Add Column
                  </button>
                </div>
                
                <div className="border rounded p-2 bg-gray-50">
                  {currentTemplate.config.columns?.length === 0 ? (
                    <p className="text-gray-500 text-sm p-2">No columns added yet</p>
                  ) : (
                    <ul className="space-y-2">
                      {currentTemplate.config.columns.map((column, index) => (
                        <li key={index} className="text-sm border-b pb-1">
                          <div className="font-medium">{column.name}</div>
                          <div className="text-xs text-gray-500">
                            Preface: &quot;{column.preface}&quot; • Closing: &quot;{column.closing}&quot;
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Conclusion Text</label>
                <textarea
                  value={conclusionText}
                  onChange={e => setConclusionText(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                  placeholder="Conclusion text..."
                ></textarea>
              </div>
              
              <div className="pt-2">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
/**
 * Template Schema Definition
 * 
 * Defines the validation schema for message templates using Zod.
 * This ensures that all templates stored in the database follow
 * a consistent structure and contain all required fields.
 */

import { z } from 'zod'

// Column configuration for CSV templates
export const columnSchema = z.object({
  name: z.string().min(1, "Column name is required"),
  preface: z.string().optional().default(""),
  closing: z.string().optional().default("")
})

// Validation rules configuration
export const validationSchema = z.object({
  rules: z.array(z.enum(["trim", "skipBlanks"])).default([]),
  allowedValues: z.array(z.string()).optional(),
  errorMessage: z.string().optional().default("")
})

// Main template configuration schema
export const templateConfigSchema = z.object({
  type: z.enum(["csv", "txt"]),
  intro: z.string().default(""),
  columns: z.array(columnSchema),
  conclusion: z.string().default(""),
  validation: validationSchema.optional().default({
    rules: [],
    errorMessage: ""
  })
})

// Schema for creating or updating a template
export const templateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Template name must be at least 3 characters"),
  description: z.string().optional(),
  type: z.enum(["csv", "txt"]),
  config: templateConfigSchema,
  folderId: z.string().uuid().optional().nullable()
})

export type TemplateConfig = z.infer<typeof templateConfigSchema>
export type Template = z.infer<typeof templateSchema>

// Error classes for template operations
export class TemplateSaveError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TemplateSaveError'
  }
}

export class TemplateValidationError extends Error {
  errors: z.ZodError
  
  constructor(errors: z.ZodError) {
    super('Template validation failed')
    this.name = 'TemplateValidationError'
    this.errors = errors
  }
} 
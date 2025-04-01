/**
 * MessageConstructor Store
 * 
 * Centralized state management for the Message Constructor component.
 * Uses Zustand for state management with devtools middleware for debugging.
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { StateCreator } from 'zustand'

/**
 * Column interface representing a single column in the data
 * @property id - Unique identifier for the column
 * @property name - Display name of the column
 * @property selected - Whether the column is selected for message construction
 * @property order - Position in the ordered list (used for drag and drop)
 * @property preface - Optional text to appear before the column value
 * @property closing - Optional text to appear after the column value
 */
export interface Column {
  id: string
  name: string
  selected: boolean
  order: number
  preface?: string
  closing?: string
}

/**
 * Configuration interface for the message construction
 * Used to communicate state changes to parent components
 */
export interface Config {
  selectedColumns: Column[]
  introduction: string
  conclusion: string
}

/**
 * Store interface defining all state properties and actions
 */
interface MessageConstructorStore {
  // State
  columns: Column[]
  introduction: string
  conclusion: string
  searchQuery: string
  currentPage: number
  itemsPerPage: number
  isDragging: boolean
  
  // Actions
  setColumns: (columns: Column[]) => void
  toggleColumnSelection: (columnId: string) => void
  updateColumnConfig: (columnId: string, updates: Partial<Column>) => void
  setIntroduction: (text: string) => void
  setConclusion: (text: string) => void
  setSearchQuery: (query: string) => void
  setCurrentPage: (page: number) => void
  selectAllColumns: (selected: boolean) => void
  reorderColumns: (activeId: string, overId: string) => void
  setIsDragging: (isDragging: boolean) => void
}

/**
 * Type for the store creator function with proper middleware typing
 */
type MessageConstructorStoreCreator = StateCreator<
  MessageConstructorStore,
  [],
  [],
  MessageConstructorStore
>

/**
 * Create the Zustand store with devtools middleware
 * Implements all state management logic for the Message Constructor
 */
export const useMessageConstructorStore = create<MessageConstructorStore>()(
  devtools(
    ((set) => ({
      // Initial state
      columns: [],
      introduction: '',
      conclusion: '',
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 25,
      isDragging: false,

      // Set or update the columns array
      setColumns: (columns: Column[]) => 
        set({ 
          columns: columns.map((col, index) => ({
            ...col,
            order: col.order ?? index
          }))
        }),
      
      // Toggle selection state of a single column
      toggleColumnSelection: (columnId: string) =>
        set((state: MessageConstructorStore) => ({
          columns: state.columns.map((col: Column) =>
            col.id === columnId ? { ...col, selected: !col.selected } : col
          ),
        })),

      // Update configuration (preface/closing) for a specific column
      updateColumnConfig: (columnId: string, updates: Partial<Column>) =>
        set((state: MessageConstructorStore) => ({
          columns: state.columns.map((col: Column) =>
            col.id === columnId ? { ...col, ...updates } : col
          ),
        })),

      // Set introduction message
      setIntroduction: (text: string) => set({ introduction: text }),
      
      // Set conclusion message
      setConclusion: (text: string) => set({ conclusion: text }),
      
      // Update search query
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      
      // Update current page number
      setCurrentPage: (page: number) => set({ currentPage: page }),
      
      // Select or deselect all columns
      selectAllColumns: (selected: boolean) =>
        set((state: MessageConstructorStore) => ({
          columns: state.columns.map((col: Column) => ({ ...col, selected })),
        })),

      // Reorder columns after drag and drop
      reorderColumns: (activeId: string, overId: string) =>
        set((state: MessageConstructorStore) => {
          const oldIndex = state.columns.findIndex((col) => col.id === activeId)
          const newIndex = state.columns.findIndex((col) => col.id === overId)

          if (oldIndex === -1 || newIndex === -1) return state

          const newColumns = [...state.columns]
          const [movedColumn] = newColumns.splice(oldIndex, 1)
          newColumns.splice(newIndex, 0, movedColumn)

          // Update order values to maintain stable sort
          return {
            columns: newColumns.map((col, index) => ({
              ...col,
              order: index
            }))
          }
        }),

      // Update dragging state for visual feedback
      setIsDragging: (isDragging: boolean) => set({ isDragging }),
    })) as MessageConstructorStoreCreator,
    { name: 'MessageConstructor' }
  )
) 
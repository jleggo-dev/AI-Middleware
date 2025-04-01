/**
 * MessageConstructor Component
 * 
 * A complex component that allows users to construct messages from data with the following features:
 * - Column selection and reordering via drag and drop
 * - Search and pagination for large datasets
 * - Custom message configuration per column
 * - Live preview of constructed messages
 * 
 * The component is divided into three main panels:
 * 1. Column Selection (Left): Manage and reorder columns
 * 2. Message Configuration (Center): Configure message templates
 * 3. Live Preview (Right): See the constructed message in real-time
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMessageConstructorStore, Config, Column } from './store'
import { SortableColumnItem } from './SortableColumnItem'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

/**
 * Custom hook for debouncing values
 * Useful for search input to prevent excessive re-renders
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns The debounced value
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Props interface for the MessageConstructor component
 */
interface Props {
  mockColumns: Array<{
    id: string
    name: string 
    selected: boolean
    order?: number // Optional in props, will be set during initialization
  }>
  mockFirstRow: Record<string, string>
  onConfigUpdate: (config: Config) => void
}

export function MessageConstructor({
  mockColumns,
  mockFirstRow,
  onConfigUpdate,
}: Props) {
  // Extract all required state and actions from the store
  const {
    columns,
    introduction,
    conclusion,
    searchQuery,
    currentPage,
    itemsPerPage,
    setColumns,
    toggleColumnSelection,
    updateColumnConfig,
    setIntroduction,
    setConclusion,
    setSearchQuery,
    setCurrentPage,
    selectAllColumns,
    reorderColumns,
    setIsDragging,
  } = useMessageConstructorStore()

  // Track the currently dragged column
  const [activeId, setActiveId] = useState<string | null>(null)

  /**
   * Configure drag and drop sensors with constraints
   * - Mouse sensor requires 5px movement to start drag
   * - Touch sensor has 250ms delay and 5px tolerance
   */
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  // Debounce search query to prevent excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  /**
   * Initialize columns with mock data
   * Ensures each column has an order value
   */
  useEffect(() => {
    setColumns(mockColumns.map((col, index) => ({
      ...col,
      order: col.order ?? index
    })))
  }, [mockColumns, setColumns])

  /**
   * Sort columns by order and filter based on search
   * This maintains the user's custom ordering while enabling search
   */
  const sortedAndFilteredColumns = useMemo(() => {
    return [...columns]
      .sort((a, b) => a.order - b.order)
      .filter((col) =>
        col.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      )
  }, [columns, debouncedSearchQuery])

  /**
   * Get paginated columns for the current page
   * Enables handling large datasets efficiently
   */
  const paginatedColumns = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedAndFilteredColumns.slice(start, start + itemsPerPage)
  }, [sortedAndFilteredColumns, currentPage, itemsPerPage])

  /**
   * Get selected columns for message construction
   * These columns will be used in the final message
   */
  const selectedColumns = useMemo(() => {
    return columns.filter((col: Column) => col.selected)
  }, [columns])

  /**
   * Update parent component when configuration changes
   * Enables external components to react to changes
   */
  useEffect(() => {
    onConfigUpdate({
      selectedColumns,
      introduction,
      conclusion,
    })
  }, [selectedColumns, introduction, conclusion, onConfigUpdate])

  /**
   * Generate preview message using selected columns and mock data
   * Updates in real-time as configurations change
   */
  const previewMessage = useMemo(() => {
    let message = introduction + '\n\n'

    selectedColumns.forEach((col: Column) => {
      const value = mockFirstRow[col.name] || `[${col.name}]`
      message += `${col.preface || ''}${value}${col.closing || ''}\n`
    })

    message += '\n' + conclusion
    return message
  }, [selectedColumns, introduction, conclusion, mockFirstRow])

  /**
   * Drag and Drop Event Handlers
   */
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    setIsDragging(true)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      reorderColumns(active.id as string, over.id as string)
    }
    
    setActiveId(null)
    setIsDragging(false)
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setIsDragging(false)
  }

  // Calculate total pages for pagination
  const totalPages = Math.ceil(sortedAndFilteredColumns.length / itemsPerPage)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      {/* Column Selection Panel */}
      <div className="border rounded-lg p-4 space-y-4">
        {/* Search Input with Icon */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search columns..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="w-full pl-10 p-2 border rounded"
          />
        </div>

        {/* Select All Checkbox */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="select-all"
            checked={columns.length > 0 && columns.every((col: Column) => col.selected)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => selectAllColumns(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="select-all" className="text-sm font-medium">
            Select All
          </label>
        </div>

        {/* Draggable Columns List */}
        <div 
          className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto"
          role="grid"
          aria-label="Draggable columns list"
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={paginatedColumns.map(col => col.id)}
              strategy={verticalListSortingStrategy}
            >
              {paginatedColumns.map((column) => (
                <SortableColumnItem
                  key={column.id}
                  column={column}
                  onToggleSelection={toggleColumnSelection}
                />
              ))}
            </SortableContext>

            {/* Drag Overlay for Visual Feedback */}
            <DragOverlay adjustScale={true}>
              {activeId ? (
                <SortableColumnItem
                  column={columns.find(col => col.id === activeId)!}
                  onToggleSelection={toggleColumnSelection}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center">
          <button
            className="px-3 py-1 border rounded text-sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-3 py-1 border rounded text-sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Message Configuration Panel */}
      <div className="border rounded-lg p-4 space-y-4">
        {/* Introduction Message Input */}
        <div>
          <label className="text-sm font-medium">Introduction Message</label>
          <textarea
            value={introduction}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setIntroduction(e.target.value)}
            placeholder="Enter introduction message..."
            className="w-full p-2 border rounded mt-1 min-h-[100px]"
          />
        </div>

        {/* Column-specific Message Configurations */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Column Configurations</h3>
          {selectedColumns.map((col: Column) => (
            <div key={col.id} className="space-y-2">
              <label className="text-sm font-medium">{col.name}</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Preface"
                  value={col.preface || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateColumnConfig(col.id, { preface: e.target.value })
                  }
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Closing"
                  value={col.closing || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateColumnConfig(col.id, { closing: e.target.value })
                  }
                  className="p-2 border rounded"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Conclusion Message Input */}
        <div>
          <label className="text-sm font-medium">Conclusion Message</label>
          <textarea
            value={conclusion}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setConclusion(e.target.value)}
            placeholder="Enter conclusion message..."
            className="w-full p-2 border rounded mt-1 min-h-[100px]"
          />
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="border rounded-lg p-4">
        <h3 className="text-sm font-medium mb-2">Live Preview</h3>
        <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-md">
          {previewMessage}
        </div>
      </div>
    </div>
  )
} 
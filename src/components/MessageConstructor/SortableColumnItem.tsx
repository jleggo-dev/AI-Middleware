/**
 * SortableColumnItem Component
 * 
 * A draggable item component used in the MessageConstructor's column list.
 * Implements drag and drop functionality using @dnd-kit/sortable.
 * Includes a drag handle, checkbox for selection, and column name display.
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Column } from './store'

interface SortableColumnItemProps {
  column: Column
  onToggleSelection: (id: string) => void
}

export function SortableColumnItem({ column, onToggleSelection }: SortableColumnItemProps) {
  // Initialize sortable functionality with the column's ID
  const {
    attributes,      // Attributes to spread on the draggable element
    listeners,       // Event listeners for the drag handle
    setNodeRef,      // Ref callback for the draggable element
    transform,       // Current transform value during drag
    transition,      // Transition style for smooth animations
    isDragging,      // Whether this item is currently being dragged
  } = useSortable({ id: column.id })

  // Combine transform and transition into a style object
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-2 p-2 bg-white rounded-md ${
        isDragging ? 'shadow-lg' : ''
      }`}
      {...attributes}
      role="row"
    >
      {/* Drag Handle Button */}
      <button
        type="button"
        className="touch-none p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
        {...listeners}
        aria-label="Drag to reorder"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="12" r="1" />
          <circle cx="9" cy="5" r="1" />
          <circle cx="9" cy="19" r="1" />
          <circle cx="15" cy="12" r="1" />
          <circle cx="15" cy="5" r="1" />
          <circle cx="15" cy="19" r="1" />
        </svg>
      </button>
      
      {/* Selection Checkbox */}
      <input
        type="checkbox"
        id={column.id}
        checked={column.selected}
        onChange={() => onToggleSelection(column.id)}
        className="rounded"
      />
      
      {/* Column Name Label */}
      <label
        htmlFor={column.id}
        className="text-sm flex-1 cursor-pointer"
        role="gridcell"
      >
        {column.name}
      </label>
    </div>
  )
} 
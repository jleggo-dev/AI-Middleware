'use client'

import { useEffect, useMemo, useState } from 'react'
import { useCSVMessageConstructorStore, CSVConfig, Column } from './store'

// Inline useDebounce hook
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

interface Props {
  mockColumns: Array<{
    id: string
    name: string 
    selected: boolean
  }>
  mockFirstRow: Record<string, string>
  onConfigUpdate: (config: CSVConfig) => void
}

export function CSVMessageConstructor({
  mockColumns,
  mockFirstRow,
  onConfigUpdate,
}: Props) {
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
  } = useCSVMessageConstructorStore()

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Initialize columns with mock data
  useEffect(() => {
    setColumns(mockColumns)
  }, [mockColumns, setColumns])

  // Filter columns based on search query
  const filteredColumns = useMemo(() => {
    return columns.filter((col: Column) =>
      col.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    )
  }, [columns, debouncedSearchQuery])

  // Paginate columns
  const paginatedColumns = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredColumns.slice(start, start + itemsPerPage)
  }, [filteredColumns, currentPage, itemsPerPage])

  // Calculate total pages
  const totalPages = Math.ceil(filteredColumns.length / itemsPerPage)

  // Get selected columns
  const selectedColumns = useMemo(() => {
    return columns.filter((col: Column) => col.selected)
  }, [columns])

  // Update parent component when config changes
  useEffect(() => {
    onConfigUpdate({
      selectedColumns,
      introduction,
      conclusion,
    })
  }, [selectedColumns, introduction, conclusion, onConfigUpdate])

  // Generate preview message
  const previewMessage = useMemo(() => {
    let message = introduction + '\n\n'

    selectedColumns.forEach((col: Column) => {
      const value = mockFirstRow[col.name] || `[${col.name}]`
      message += `${col.preface || ''}${value}${col.closing || ''}\n`
    })

    message += '\n' + conclusion
    return message
  }, [selectedColumns, introduction, conclusion, mockFirstRow])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      {/* Column Selection Panel */}
      <div className="border rounded-lg p-4 space-y-4">
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

        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {paginatedColumns.map((col: Column) => (
            <div key={col.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={col.id}
                checked={col.selected}
                onChange={() => toggleColumnSelection(col.id)}
                className="rounded"
              />
              <label htmlFor={col.id} className="text-sm">
                {col.name}
              </label>
            </div>
          ))}
        </div>

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
        <div>
          <label className="text-sm font-medium">Introduction Message</label>
          <textarea
            value={introduction}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setIntroduction(e.target.value)}
            placeholder="Enter introduction message..."
            className="w-full p-2 border rounded mt-1 min-h-[100px]"
          />
        </div>

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
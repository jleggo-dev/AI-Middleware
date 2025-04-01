import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { StateCreator } from 'zustand'

export interface Column {
  id: string
  name: string
  selected: boolean
  preface?: string
  closing?: string
}

export interface CSVConfig {
  selectedColumns: Column[]
  introduction: string
  conclusion: string
}

interface CSVMessageConstructorStore {
  columns: Column[]
  introduction: string
  conclusion: string
  searchQuery: string
  currentPage: number
  itemsPerPage: number
  
  // Actions
  setColumns: (columns: Column[]) => void
  toggleColumnSelection: (columnId: string) => void
  updateColumnConfig: (columnId: string, updates: Partial<Column>) => void
  setIntroduction: (text: string) => void
  setConclusion: (text: string) => void
  setSearchQuery: (query: string) => void
  setCurrentPage: (page: number) => void
  selectAllColumns: (selected: boolean) => void
}

type CSVMessageConstructorStoreCreator = StateCreator<
  CSVMessageConstructorStore,
  [],
  [],
  CSVMessageConstructorStore
>

export const useCSVMessageConstructorStore = create<CSVMessageConstructorStore>()(
  devtools(
    ((set) => ({
      columns: [],
      introduction: '',
      conclusion: '',
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 25,

      setColumns: (columns: Column[]) => set({ columns }),
      
      toggleColumnSelection: (columnId: string) =>
        set((state: CSVMessageConstructorStore) => ({
          columns: state.columns.map((col: Column) =>
            col.id === columnId ? { ...col, selected: !col.selected } : col
          ),
        })),

      updateColumnConfig: (columnId: string, updates: Partial<Column>) =>
        set((state: CSVMessageConstructorStore) => ({
          columns: state.columns.map((col: Column) =>
            col.id === columnId ? { ...col, ...updates } : col
          ),
        })),

      setIntroduction: (text: string) => set({ introduction: text }),
      
      setConclusion: (text: string) => set({ conclusion: text }),
      
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      
      setCurrentPage: (page: number) => set({ currentPage: page }),
      
      selectAllColumns: (selected: boolean) =>
        set((state: CSVMessageConstructorStore) => ({
          columns: state.columns.map((col: Column) => ({ ...col, selected })),
        })),
    })) as CSVMessageConstructorStoreCreator,
    { name: 'CSVMessageConstructor' }
  )
) 
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { AppData } from '../types'
import { apiGetData, apiSaveData } from '../lib/api'

const DEFAULT_DATA: AppData = { trabajadores: [], registros: [], pagos: [], proyectos: [] }

interface DataContextValue {
  data: AppData
  updateData: (updater: (d: AppData) => AppData) => void
  loading: boolean
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<AppData>(DEFAULT_DATA)
  const [loading, setLoading] = useState(true)
  const dataRef = useRef<AppData>(DEFAULT_DATA)

  useEffect(() => {
    setLoading(true)
    apiGetData()
      .then(d => {
        dataRef.current = d
        setDataState(d)
      })
      .finally(() => setLoading(false))
  }, [])

  const updateData = useCallback((updater: (d: AppData) => AppData) => {
    // Shallow clone arrays so updater mutations don't affect the ref directly
    const current = dataRef.current
    const draft: AppData = {
      trabajadores: [...current.trabajadores],
      registros: [...current.registros],
      pagos: [...current.pagos],
      proyectos: [...current.proyectos],
    }
    const next = updater(draft)
    dataRef.current = next
    setDataState(next)
    // Fire-and-forget sync to Supabase
    apiSaveData(next)
  }, [])

  return (
    <DataContext.Provider value={{ data, updateData, loading }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}

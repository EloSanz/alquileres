import React, { createContext, useContext } from 'react'
import { treaty } from '@elysiajs/eden'

// Import the App type from the server
import type { App } from '../../../server/src/index'

const ApiContext = createContext<ReturnType<typeof treaty<App>> | null>(null)

export const useApi = () => {
  const context = useContext(ApiContext)
  if (!context) throw new Error('useApi must be used within ApiProvider')
  return context
}

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const api = treaty<App>(import.meta.env.VITE_API_URL || 'http://localhost:3000')

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
}

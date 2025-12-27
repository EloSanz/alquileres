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
  // Siempre usar ruta relativa /pentamont
  // En desarrollo: Vite proxy maneja /pentamont/api -> localhost:4000
  // En producción: Nginx maneja /pentamont/api -> localhost:4000
  const apiUrl = import.meta.env.VITE_API_URL || '/pentamont'
  
  const api = treaty<App>(apiUrl, {
    headers: () => {
      const token = localStorage.getItem('token')
      if (token) {
        return { Authorization: `Bearer ${token}` } as HeadersInit
      }
      return undefined
    }
  })

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
}

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
  // En desarrollo, usar ruta relativa que será manejada por Vite proxy
  // En producción, usar la URL completa con el prefijo
  const baseUrl = import.meta.env.VITE_API_URL || '/pentamont'
  const apiUrl = baseUrl.startsWith('http')
    ? `${baseUrl}/pentamont`  // Producción: URL completa con prefijo
    : baseUrl  // Desarrollo: ruta relativa, Vite proxy maneja /pentamont/api
  
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

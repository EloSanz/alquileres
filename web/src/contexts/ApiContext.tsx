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
  // Construir URL completa basada en el origen actual
  // En desarrollo: Vite proxy maneja /pentamont/api -> localhost:4000
  // En producción: Nginx maneja /pentamont/api -> localhost:4000
  const basePath = import.meta.env.VITE_API_URL || '/pentamont'
  // Construir URL completa usando el origen actual
  const apiUrl = basePath.startsWith('http') 
    ? basePath 
    : `${window.location.origin}${basePath.startsWith('/') ? basePath : `/${basePath}`}`
  
  const api = treaty<App>(apiUrl, {
    headers: () => {
      const token = localStorage.getItem('token')
      if (token) {
        // Limpiar el token antes de enviarlo (quitar espacios y comillas)
        const cleanToken = String(token).trim().replace(/^["']|["']$/g, '')
        
        // Validar formato JWT (debe tener 3 partes separadas por puntos)
        if (cleanToken && cleanToken.split('.').length === 3) {
          return { Authorization: `Bearer ${cleanToken}` } as HeadersInit
        } else {
          // Token malformado, limpiarlo
          console.error('Token malformado detectado, limpiando localStorage', {
            length: cleanToken.length,
            parts: cleanToken.split('.').length,
            preview: cleanToken.substring(0, 20)
          })
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      return undefined
    }
  })

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
}

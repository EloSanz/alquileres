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

// Función para manejar token inválido y redirigir al login
export const handleInvalidToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  const path = window.location.pathname;
  if (path.startsWith('/pentamont')) {
    window.location.href = '/pentamont/login';
  }
}

// Función helper para verificar errores de autenticación en respuestas
export const checkAuthError = (error: any): boolean => {
  if (!error) return false
  
  const errorValue = typeof error === 'object' && error.error ? error.error.value : error
  const errorMessage = typeof errorValue === 'string' 
    ? errorValue 
    : (errorValue as any)?.message || ''
  
  const isAuthError = errorMessage.includes('Invalid token') || 
                     errorMessage.includes('No token provided') ||
                     errorMessage.includes('Unauthorized') ||
                     (typeof errorValue === 'object' && (errorValue as any)?.status === 401) ||
                     (error as any)?.status === 401
  
  if (isAuthError) {
    console.warn('Error de autenticación detectado, redirigiendo al login')
    handleInvalidToken()
  }
  
  return isAuthError
}

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  // Usar solo el origen para que Eden Treaty maneje las rutas correctamente
  // Las rutas se accederán como api.pentamont.api.tenants.get()
  // En desarrollo: Vite proxy maneja /pentamont/api -> localhost:4000
  // En producción: Nginx maneja /pentamont/api -> localhost:4000
  const apiUrl = window.location.origin
  
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
          // Token malformado, limpiarlo y redirigir
          console.error('Token malformado detectado, redirigiendo al login')
          handleInvalidToken()
        }
      }
      return undefined
    }
  })

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
}

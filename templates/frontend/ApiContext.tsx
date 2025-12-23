import React, { createContext, useContext, useMemo } from 'react'
import { treaty } from '@elysiajs/eden'
import type { App } from '../../../server/src/index'

const ApiContext = createContext<ReturnType<typeof treaty<App>> | null>(null)

export const useApi = () => {
  const context = useContext(ApiContext)
  if (!context) throw new Error('useApi must be used within ApiProvider')
  return context
}

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const api = useMemo(() => {
    const client = treaty<App>(import.meta.env.VITE_API_URL || 'http://localhost:3000')

    return new Proxy(client, {
      get(target, prop) {
        const original = target[prop as keyof typeof target]
        if (typeof original === 'function' || typeof original === 'object') {
          return new Proxy(original as any, {
            get(methodTarget, methodProp) {
              const method = methodTarget[methodProp]
              if (typeof method === 'function') {
                return async (...args: any[]) => {
                  const token = localStorage.getItem('token')
                  const headers = token ? { Authorization: `Bearer ${token}` } : {}

                  const lastArg = args[args.length - 1]
                  if (typeof lastArg === 'object' && lastArg !== null) {
                    args[args.length - 1] = {
                      ...lastArg,
                      headers: { ...lastArg.headers, ...headers }
                    }
                  } else {
                    args.push({ headers })
                  }

                  try {
                    return await method(...args)
                  } catch (error: any) {
                    if (error?.status === 401) {
                      localStorage.removeItem('token')
                      window.location.href = '/login'
                    }
                    throw error
                  }
                }
              }
              return method
            }
          })
        }
        return original
      }
    })
  }, [])

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
}

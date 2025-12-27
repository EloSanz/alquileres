import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/pentamont/',
  plugins: [react()],
  server: {
    port: 4001,
    host: true, // Permitir acceso desde cualquier host
    allowedHosts: [
      'icards.fun',
      'www.icards.fun',
      'localhost'
    ],
    proxy: {
      '/pentamont/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
        // No usar rewrite - el backend espera el prefijo completo
      }
    }
  }
})

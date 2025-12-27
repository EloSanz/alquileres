import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/pentamont/',
  plugins: [react()],
  server: {
    port: 4001,
    proxy: {
      '/pentamont/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
        // No usar rewrite - el backend espera el prefijo completo
      }
    }
  }
})

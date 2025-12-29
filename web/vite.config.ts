import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/pentamont/',
  plugins: [react()],
  resolve: {
    // Priorizar .ts sobre .js para archivos TypeScript
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    // Alias para imports más limpios (opcional, los imports relativos también funcionarán)
    alias: {
      '@shared': path.resolve(__dirname, '../shared')
    }
  },
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

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
      '@shared': path.resolve(__dirname, '../shared'),
      'zod': path.resolve(__dirname, './node_modules/zod')
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
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pentamont/, '')
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
        },
      },
    },
  },
})

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno según el modo (development, production)
  // process.cwd() es necesario porque el archivo está en web/
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: env.VITE_BASE_URL || '/', // Usa la variable definida en .env.[mode]
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
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
        '/pentamont/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/pentamont/, '')
        }
      }
    },
    preview: {
      port: 4001,
      host: true,
      allowedHosts: [
        'icards.fun',
        'www.icards.fun',
        'localhost'
      ],
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
        '/pentamont/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/pentamont/, '')
        }
      }
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
            mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          },
        },
      },
    },
  }
})

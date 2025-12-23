import { Elysia } from 'elysia'
import { createServer } from 'node:http'
import { userRoutes } from './routes/user.routes'
import { protectedRoutes } from './routes/protected.routes'
import { authRoutes } from './routes/auth.routes'
import { errorPlugin } from './plugins/error.plugin'

// Initialize app
const app = new Elysia()
  .use(errorPlugin)
  .use(authRoutes)  // Auth routes don't need auth plugin (register/login are public)
  .use(userRoutes)
  .group('/api', app => app
    .use(protectedRoutes)  // All protected routes under /api with auth
  )
  .get('/', () => ({ message: 'Rental Management API is running', timestamp: new Date().toISOString() }))

// Create HTTP server for Node.js
const server = createServer(async (req, res) => {
  const startTime = Date.now()
  const method = req.method || 'GET'
  const url = req.url || '/'

  console.log(`[${new Date().toISOString()}] ${method} ${url} - Request started`)

  try {
    // Read request body
    let body = ''
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      for await (const chunk of req) {
        body += chunk
      }
      // Don't log auth route bodies (sensitive data)
      const isAuthRoute = url.startsWith('/api/auth')
      if (body && !isAuthRoute) {
        console.log(`[${new Date().toISOString()}] ${method} ${url} - Request body:`, body.substring(0, 200) + (body.length > 200 ? '...' : ''))
      } else if (body && isAuthRoute) {
        console.log(`[${new Date().toISOString()}] ${method} ${url} - Request body: [REDACTED - Auth route]`)
      }
    }

    // Convert Node.js request to Web API Request
    const requestUrl = `http://localhost:3000${req.url}`
    const request = new Request(requestUrl, {
      method: req.method,
      headers: req.headers as any,
      body: body || undefined,
    })

    const response = await app.fetch(request)

    const duration = Date.now() - startTime
    console.log(`[${new Date().toISOString()}] ${method} ${url} - Response: ${response.status} (${duration}ms)`)

    res.statusCode = response.status
    response.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    const responseBody = await response.text()
    const isAuthRoute = url.startsWith('/api/auth')
    if (response.status >= 400 && !isAuthRoute) {
      console.log(`[${new Date().toISOString()}] ${method} ${url} - Error response body:`, responseBody.substring(0, 500))
    } else if (response.status >= 400 && isAuthRoute) {
      console.log(`[${new Date().toISOString()}] ${method} ${url} - Error response: [REDACTED - Auth route]`)
    }

    res.end(responseBody)
  } catch (err) {
    const duration = Date.now() - startTime
    console.error(`[${new Date().toISOString()}] ${method} ${url} - Server error (${duration}ms):`, err)
    res.statusCode = 500
    res.end('Internal Server Error')
  }
})

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  server.close(() => {
    console.log('Server closed.')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...')
  server.close(() => {
    console.log('Server closed.')
    process.exit(0)
  })
})

server.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000')
  console.log('Press Ctrl+C to stop the server')
})

// Export fetch for testing
export default app.fetch

// Export type for Eden Treaty
export type App = typeof app

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
  try {
    // Read request body
    let body = ''
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      for await (const chunk of req) {
        body += chunk
      }
    }

    // Convert Node.js request to Web API Request
    const url = `http://localhost:3000${req.url}`
    const request = new Request(url, {
      method: req.method,
      headers: req.headers as any,
      body: body || undefined,
    })

    const response = await app.fetch(request)

    res.statusCode = response.status
    response.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    const responseBody = await response.text()
    res.end(responseBody)
  } catch (err) {
    console.error('Server error:', err)
    res.statusCode = 500
    res.end('Internal Server Error')
  }
})

server.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000')
})

// Export fetch for testing
export default app.fetch

// Export type for Eden Treaty
export type App = typeof app

import { Elysia } from 'elysia'
import { createServer } from 'node:http'
import { userRoutes } from './routes/user.routes'
import { tenantRoutes } from './routes/tenant.routes'
import { authPlugin } from './plugins/auth.plugin'
import { errorPlugin } from './plugins/error.plugin'

// Initialize app
const app = new Elysia()
  .use(errorPlugin)
  .use(authPlugin)
  .use(userRoutes)
  .use(tenantRoutes)
  .get('/', () => ({ message: 'Rental Management API is running', timestamp: new Date().toISOString() }))

// Create HTTP server for Node.js
const server = createServer(async (req, res) => {
  try {
    // Convert Node.js request to Web API Request
    const url = `http://localhost:3000${req.url}`
    const request = new Request(url, {
      method: req.method,
      headers: req.headers as any,
    })

    const response = await app.fetch(request)

    res.statusCode = response.status
    response.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    const body = await response.text()
    res.end(body)
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

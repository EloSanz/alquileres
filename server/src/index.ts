import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { createServer } from 'node:http'
import { userRoutes } from './routes/user.routes'
import { protectedRoutes } from './routes/protected.routes'
import { authRoutes } from './routes/auth.routes'
import { errorPlugin } from './plugins/error.plugin'
import { logRequest, logResponse, logError, logRequestBody } from './utils/logger'
import { JWT_SECRET } from './types/jwt.types'
import { verify as jwtVerify } from 'jsonwebtoken'
import { PrismaUserRepository } from './implementations/repositories/PrismaUserRepository'
import { randomUUID } from 'crypto'

// Initialize user repository for username lookup
const userRepository = new PrismaUserRepository()

// Helper function to extract username from JWT token
async function getUsernameFromToken(authHeader: string | undefined): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  try {
    const token = authHeader.substring(7)
    const decoded = jwtVerify(token, JWT_SECRET) as any
    const userId = decoded.userId

    if (!userId) {
      return null
    }

    const user = await userRepository.findById(userId)
    return user ? user.username : null
  } catch (error) {
    // Token invalid or expired
    return null
  }
}

// Initialize app
const app = new Elysia()
  .use(errorPlugin)
  .use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))
  .group('/pentamont/lodemas', app => app
    .use(authRoutes)  // Auth routes don't need auth plugin (register/login are public)
    .use(userRoutes)
    .group('/api', app => app
      .use(protectedRoutes)  // All protected routes under /api with auth
    )
    .get('/', () => ({ message: 'Rental Management API is running', timestamp: new Date().toISOString() }))
  )

// Helper function to extract IP address from request
function getClientIP(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  )
}

// Create HTTP server for Node.js
const server = createServer(async (req, res) => {
  const startTime = Date.now()
  const method = req.method || 'GET'
  const url = req.url || '/'
  const authHeader = req.headers.authorization
  
  // Generate unique request ID for correlation
  const requestId = randomUUID()
  const clientIP = getClientIP(req)

  // Extract username from token (async, but we'll await it when logging)
  const usernamePromise = getUsernameFromToken(authHeader)

  // Skip logging for OPTIONS (CORS preflight) and GET requests
  // Only log requests for UPDATE (PUT/PATCH), DELETE, POST
  if (method === 'OPTIONS' || method === 'GET') {
    // Skip logging for OPTIONS and GET requests
  } else if (method === 'PUT' || method === 'PATCH' || method === 'DELETE' || method === 'POST') {
    const username = await usernamePromise
    logRequest(method, url, undefined, username || undefined, requestId, clientIP)
  }

  try {
    // Read request body
    let body = ''
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      for await (const chunk of req) {
        body += chunk
      }
      // Log request body for POST/PUT/PATCH (excluding auth routes for security)
      const isAuthRoute = url.startsWith('/api/auth')
      if (!isAuthRoute && body) {
        const username = await usernamePromise
        logRequestBody(method, url, body, requestId, username || undefined)
      }
    }

    // Convert Node.js request to Web API Request
    const requestUrl = `http://localhost:4000${req.url}`
    const request = new Request(requestUrl, {
      method: req.method,
      headers: req.headers as any,
      body: body || undefined,
    })

    const response = await app.fetch(request)

    const duration = Date.now() - startTime

    // Skip logging for OPTIONS (CORS preflight) responses
    if (method === 'OPTIONS') {
      res.statusCode = response.status
      response.headers.forEach((value: string, key: string) => {
        res.setHeader(key, value)
      })
      const responseBody = await response.text()
      res.end(responseBody)
      return
    }

    // Log responses for:
    // - Errors (status >= 400)
    // - UPDATE operations (PUT/PATCH) - even if successful
    // - DELETE operations - even if successful
    // - POST operations - even if successful
    // - Very slow requests (>1000ms)
    // - Skip successful GET requests (200 OK)
    const isUpdateOrDeleteOrPost = method === 'PUT' || method === 'PATCH' || method === 'DELETE' || method === 'POST'
    const shouldLogResponse = response.status >= 400 || isUpdateOrDeleteOrPost || duration > 1000
    
    if (shouldLogResponse) {
      const username = await usernamePromise
      logResponse(method, url, response.status, duration, undefined, username || undefined, requestId, clientIP)
    }

    res.statusCode = response.status
    response.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value)
    })

    const responseBody = await response.text()
    const isAuthRoute = url.startsWith('/api/auth')
    if (response.status >= 400) {
      const username = await usernamePromise
      const userInfo = username ? { username } : {}
      if (!isAuthRoute) {
        logError(`Error response body: ${responseBody.substring(0, 500)}`, undefined, { method, url, statusCode: response.status, requestId, ip: clientIP, ...userInfo })
      } else {
        logError('Error response: [REDACTED - Auth route]', undefined, { method, url, statusCode: response.status, requestId, ip: clientIP, ...userInfo })
      }
    }

    res.end(responseBody)
  } catch (err) {
    const duration = Date.now() - startTime
    const username = await getUsernameFromToken(req.headers.authorization)
    const userInfo = username ? { username } : {}
    logError(`Server error`, err, { method, url, duration, requestId, ip: clientIP, ...userInfo })
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

server.listen(4000, () => {
  console.log('🚀 Server running at http://localhost:4000')
  console.log('Press Ctrl+C to stop the server')
})

// Export fetch for testing
export default app.fetch

// Export type for Eden Treaty
export type App = typeof app

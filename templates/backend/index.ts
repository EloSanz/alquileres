import { Elysia } from 'elysia'
import { userRoutes } from './routes/user.routes'
import { authPlugin } from './plugins/auth.plugin'
import { errorPlugin } from './plugins/error.plugin'

// Initialize app
const app = new Elysia()
  .use(errorPlugin)
  .use(authPlugin)
  .use(userRoutes)
  .get('/', () => ({ message: 'API is running', timestamp: new Date().toISOString() }))
  .listen(3000)

console.log(`🚀 Server running at http://localhost:${app.server?.port}`)

// Export type for Eden Treaty
export type App = typeof app

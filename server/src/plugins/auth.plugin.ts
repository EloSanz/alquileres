import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'

export const authPlugin = new Elysia()
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'default-dev-secret-change-in-production'
  }))
  .derive(({ jwt, cookie: { auth } }) => ({
    getCurrentUser: async () => {
      const token = auth?.value
      if (!token) throw new Error('No token provided')

      const payload = await jwt.verify(token)
      if (!payload) throw new Error('Invalid token')

      return { userId: payload.userId as number }
    }
  }))

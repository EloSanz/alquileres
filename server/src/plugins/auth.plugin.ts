import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { AuthService } from '../implementations/services/AuthService'
import { PrismaUserRepository } from '../implementations/repositories/PrismaUserRepository'

// Initialize dependencies
const userRepository = new PrismaUserRepository()
const authService = new AuthService(userRepository)

export const authPlugin = new Elysia()
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'default-dev-secret-change-in-production'
  }))
  .derive(({ jwt, headers }) => ({
    getCurrentUserId: async (): Promise<number> => {
      const authHeader = headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No token provided')
      }

      const token = authHeader.substring(7) // Remove 'Bearer ' prefix
      const payload = await jwt.verify(token)
      if (!payload) throw new Error('Invalid token')

      return payload.userId as number
    }
  }))

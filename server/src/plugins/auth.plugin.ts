import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'

export const authPlugin = new Elysia()
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'default-dev-secret-change-in-production'
  }))
 
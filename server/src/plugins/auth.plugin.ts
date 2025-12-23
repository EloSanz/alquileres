import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { JWT_SECRET } from '../types/jwt.types'

export const authPlugin = new Elysia()
  .use(jwt({
    name: 'jwt',
    secret: JWT_SECRET
  }))
 
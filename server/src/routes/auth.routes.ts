import { Elysia, t } from 'elysia';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../implementations/services/AuthService';
import { PrismaUserRepository } from '../implementations/repositories/PrismaUserRepository';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../types/jwt.types';

// Dependency injection
const userRepository = new PrismaUserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

// Helper function to verify token
const verifyToken = (token: string): number => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.userId;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const authRoutes = new Elysia({ prefix: '/api/auth' })
  .post('/register', authController.register, {
    body: t.Object({
      username: t.String({ minLength: 3 }),
      email: t.String({ minLength: 5 }),
      password: t.String({ minLength: 6 })
    }),
    detail: {
      tags: ['Authentication'],
      summary: 'Register a new admin user'
    }
  })
  .post('/login', authController.login, {
    body: t.Object({
      identifier: t.String({ minLength: 3 }),
      password: t.String({ minLength: 1 })
    }),
    detail: {
      tags: ['Authentication'],
      summary: 'Login with email or username and password'
    }
  })
  .get('/me', async ({ headers }) => {
    const authHeader = headers.authorization;
    console.log('[Auth Routes /me] Checking auth header:', authHeader ? 'present' : 'missing') // Safe to log

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[Auth Routes /me] No token provided')
      return {
        success: false,
        message: 'No token provided',
        statusCode: 401,
        timestamp: new Date().toISOString()
      };
    }

    const token = authHeader.substring(7);
    let userId: number;

    try {
      console.log('[Auth Routes /me] Verifying token...')
      userId = verifyToken(token);
      console.log('[Auth Routes /me] Token verified, userId:', userId)
    } catch (error: any) {
      console.log('[Auth Routes /me] Token verification failed:', error.message)
      return {
        success: false,
        message: 'Invalid token',
        statusCode: 401,
        timestamp: new Date().toISOString()
      };
    }

    console.log('[Auth Routes /me] Getting user data for userId:', userId)
    return await authController.getCurrentUser(userId);
  }, {
    detail: {
      tags: ['Authentication'],
      summary: 'Get current user information'
    }
  })
  .get('/users', authController.getAllUsers, {
    detail: {
      tags: ['Authentication'],
      summary: 'Get all admin users'
    }
  })

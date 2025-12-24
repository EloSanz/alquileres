import { Elysia, t } from 'elysia';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../implementations/services/AuthService';
import { PrismaUserRepository } from '../implementations/repositories/PrismaUserRepository';
import { JWT_SECRET } from '../types/jwt.types';
import { verify as jwtVerify } from 'jsonwebtoken';
import { logError, logInfo } from '../utils/logger';

// Dependency injection
const userRepository = new PrismaUserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

// Helper function to verify token
const verifyToken = (token: string): number => {
  try {
    const decoded = jwtVerify(token, JWT_SECRET) as any;
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
    // Auth header presence is now logged by the global logger

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logError('No token provided', undefined, { route: 'auth/me', method: 'GET' })
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
      // Token verification is now handled silently
      userId = verifyToken(token);
      // Token verification success is logged by global logger
    } catch (error: any) {
      logError('Token verification failed', error, { route: 'auth/me', method: 'GET' })
      return {
        success: false,
        message: 'Invalid token',
        statusCode: 401,
        timestamp: new Date().toISOString()
      };
    }

    logInfo('Getting user data', { userId, route: 'auth/me' })
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

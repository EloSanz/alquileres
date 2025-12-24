import { Elysia, t } from 'elysia';
import { TenantController } from '../controllers/tenant.controller';
import { TenantService } from '../implementations/services/TenantService';
import { PrismaTenantRepository } from '../implementations/repositories/PrismaTenantRepository';
import { PrismaPaymentRepository } from '../implementations/repositories/PrismaPaymentRepository';
import { authPlugin } from '../plugins/auth.plugin';
import { JWTPayload, JWT_SECRET } from '../types/jwt.types';
import { verify as jwtVerify } from 'jsonwebtoken';

// Dependency injection
const tenantRepository = new PrismaTenantRepository();
const paymentRepository = new PrismaPaymentRepository();
const tenantService = new TenantService(tenantRepository, paymentRepository);
const tenantController = new TenantController(tenantService);

export const tenantRoutes = new Elysia({ prefix: '/tenants' })
  .use(authPlugin)
  .derive(async ({ headers }) => {
    const authHeader: string | undefined = headers.authorization
    console.log('[Tenant Routes] Checking auth header:', authHeader ? 'present' : 'missing')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[Tenant Routes] No token provided')
      throw new Error('No token provided')
    }

    const token: string = authHeader.substring(7)
    console.log('[Tenant Routes] Token extracted, verifying...')

    try {
      const payload = jwtVerify(token, JWT_SECRET) as JWTPayload
      console.log('[Tenant Routes] Token verified, userId:', payload.userId)

      return { userId: payload.userId }
    } catch (error: any) {
      console.log('[Tenant Routes] Token verification failed:', error.message)
      throw new Error('Invalid token')
    }
  })
  .get('/', tenantController.getAll, {
    detail: {
      tags: ['Tenants'],
      summary: 'Get all tenants'
    }
  })
  .get('/:id', tenantController.getById, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    detail: {
      tags: ['Tenants'],
      summary: 'Get tenant by ID'
    }
  })
  .get('/document/:documentId', tenantController.getByDocumentId, {
    params: t.Object({
      documentId: t.String({ minLength: 5 })
    }),
    detail: {
      tags: ['Tenants'],
      summary: 'Get tenant by document ID'
    }
  })
  .post('/', tenantController.create, {
    body: t.Object({
      firstName: t.String({ minLength: 2 }),
      lastName: t.String({ minLength: 2 }),
      email: t.String({ format: 'email' }),
      phone: t.Optional(t.String()),
      documentId: t.String({ minLength: 5 }),
      address: t.Optional(t.String()),
      birthDate: t.Optional(t.String())
    }),
    detail: {
      tags: ['Tenants'],
      summary: 'Create new tenant'
    }
  })
  .put('/:id', tenantController.update, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    body: t.Object({
      firstName: t.Optional(t.String({ minLength: 2 })),
      lastName: t.Optional(t.String({ minLength: 2 })),
      email: t.Optional(t.String({ format: 'email' })),
      phone: t.Optional(t.String()),
      address: t.Optional(t.String()),
      birthDate: t.Optional(t.String())
    }),
    detail: {
      tags: ['Tenants'],
      summary: 'Update tenant'
    }
  })
  .delete('/:id', tenantController.delete, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    detail: {
      tags: ['Tenants'],
      summary: 'Delete tenant'
    }
  });

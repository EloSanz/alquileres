import { Elysia, t } from 'elysia';
import { TenantController } from '../controllers/tenant.controller';
import { TenantService } from '../implementations/services/TenantService';
import { PrismaTenantRepository } from '../implementations/repositories/PrismaTenantRepository';
import { PrismaPaymentRepository } from '../implementations/repositories/PrismaPaymentRepository';
import { PrismaPropertyRepository } from '../implementations/repositories/PrismaPropertyRepository';
import { authPlugin } from '../plugins/auth.plugin';
import { JWTPayload, JWT_SECRET } from '../types/jwt.types';
import { verify as jwtVerify } from 'jsonwebtoken';
import { logError } from '../utils/logger';

// Dependency injection
const tenantRepository = new PrismaTenantRepository();
const paymentRepository = new PrismaPaymentRepository();
const propertyRepository = new PrismaPropertyRepository();
const tenantService = new TenantService(tenantRepository, paymentRepository, propertyRepository);
const tenantController = new TenantController(tenantService);

// Validation schemas - aligned with DTOs for consistency
const idParamsSchema = t.Object({
  id: t.Numeric({ minimum: 1 })
});

const documentIdParamsSchema = t.Object({
  documentId: t.String({ minLength: 5 })
});

const createTenantBodySchema = t.Object({
  firstName: t.String({ minLength: 2 }),
  lastName: t.String({ minLength: 2 }),
  phone: t.Optional(t.String()),
  documentId: t.String({ minLength: 5 }),
  numeroLocal: t.Optional(t.String()),
  rubro: t.Optional(t.String()),
  fechaInicioContrato: t.Optional(t.String())
});

const updateTenantBodySchema = t.Object({
  firstName: t.Optional(t.String({ minLength: 2 })),
  lastName: t.Optional(t.String({ minLength: 2 })),
  phone: t.Optional(t.String()),
  documentId: t.Optional(t.String({ minLength: 5 })),
  numeroLocal: t.Optional(t.String()),
  rubro: t.Optional(t.String()),
  fechaInicioContrato: t.Optional(t.String()),
  estadoPago: t.Optional(t.String())
});

export const tenantRoutes = new Elysia({ prefix: '/tenants' })
  .use(authPlugin)
  .derive(async ({ headers, request }) => {
    const authHeader: string | undefined = headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logError('No token provided', undefined, { route: 'tenants', method: request.method, url: request.url })
      throw new Error('No token provided')
    }

    const token: string = authHeader.substring(7).trim()
    
    // Debug: Log token format (solo primeros y últimos caracteres por seguridad)
    if (token.length < 10 || token.split('.').length !== 3) {
      logError('Token malformed - invalid format', undefined, { 
        route: 'tenants', 
        method: request.method, 
        url: request.url,
        tokenLength: token.length,
        tokenParts: token.split('.').length,
        tokenPreview: token.substring(0, 10) + '...' + token.substring(token.length - 10)
      })
      throw new Error('Invalid token')
    }

    try {
      const payload = jwtVerify(token, JWT_SECRET) as JWTPayload
      return { userId: payload.userId }
    } catch (error: any) {
      logError('Token verification failed', error, { 
        route: 'tenants', 
        method: request.method, 
        url: request.url,
        errorMessage: error.message,
        tokenLength: token.length,
        tokenParts: token.split('.').length
      })
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
    params: idParamsSchema,
    detail: {
      tags: ['Tenants'],
      summary: 'Get tenant by ID'
    }
  })
  .get('/document/:documentId', tenantController.getByDocumentId, {
    params: documentIdParamsSchema,
    detail: {
      tags: ['Tenants'],
      summary: 'Get tenant by document ID'
    }
  })
  .post('/', tenantController.create, {
    body: createTenantBodySchema,
    detail: {
      tags: ['Tenants'],
      summary: 'Create new tenant'
    }
  })
  .put('/:id', tenantController.update, {
    params: idParamsSchema,
    body: updateTenantBodySchema,
    detail: {
      tags: ['Tenants'],
      summary: 'Update tenant'
    }
  })
  .delete('/:id', tenantController.delete, {
    params: idParamsSchema,
    detail: {
      tags: ['Tenants'],
      summary: 'Delete tenant'
    }
  });

import { Elysia, t } from 'elysia';
import { PropertyController } from '../controllers/property.controller';
import { PropertyService } from '../implementations/services/PropertyService';
import { PrismaPropertyRepository } from '../implementations/repositories/PrismaPropertyRepository';
import { PrismaTenantRepository } from '../implementations/repositories/PrismaTenantRepository';
import { PrismaPaymentRepository } from '../implementations/repositories/PrismaPaymentRepository';
import { authPlugin } from '../plugins/auth.plugin';
import { JWTPayload, JWT_SECRET } from '../types/jwt.types';
import { verify as jwtVerify } from 'jsonwebtoken';
import { logError } from '../utils/logger';

// Dependency injection
const propertyRepository = new PrismaPropertyRepository();
const tenantRepository = new PrismaTenantRepository();
const paymentRepository = new PrismaPaymentRepository();
const propertyService = new PropertyService(propertyRepository, tenantRepository, paymentRepository);
const propertyController = new PropertyController(propertyService);

export const propertyRoutes = new Elysia({ prefix: '/properties' })
  .use(authPlugin)
  .derive(async ({ headers, request }) => {
    const authHeader: string | undefined = headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logError('No token provided', undefined, { route: 'properties', method: request.method, url: request.url })
      throw new Error('No token provided')
    }

    const token: string = authHeader.substring(7)

    try {
      const payload = jwtVerify(token, JWT_SECRET) as JWTPayload
      return { userId: payload.userId }
    } catch (error: any) {
      logError('Token verification failed', error, { route: 'properties', method: request.method, url: request.url })
      throw new Error('Invalid token')
    }
  })
  .get('/', propertyController.getAll, {
    detail: {
      tags: ['Properties'],
      summary: 'Get all properties'
    }
  })
  .get('/:id', propertyController.getById, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    detail: {
      tags: ['Properties'],
      summary: 'Get property by ID'
    }
  })
  .post('/', propertyController.create, {
    body: t.Object({
      name: t.String({ minLength: 2 }),
      localNumber: t.Number({ minimum: 1 }),
      state: t.String({ minLength: 2 }),
      zipCode: t.Optional(t.String()),
      propertyType: t.String(),
      bedrooms: t.Optional(t.Number()),
      bathrooms: t.Optional(t.Number()),
      areaSqm: t.Optional(t.Number()),
      monthlyRent: t.Number({ minimum: 0 }),
      description: t.Optional(t.String()),
      isAvailable: t.Optional(t.Boolean()),
      tenantId: t.Number({ minimum: 1 })
    }),
    detail: {
      tags: ['Properties'],
      summary: 'Create new property'
    }
  })
  .put('/:id', propertyController.update, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    body: t.Object({
      name: t.Optional(t.String({ minLength: 2 })),
      address: t.Optional(t.String({ minLength: 5 })),
      city: t.Optional(t.String({ minLength: 2 })),
      state: t.Optional(t.String({ minLength: 2 })),
      zipCode: t.Optional(t.String()),
      propertyType: t.Optional(t.String()),
      bedrooms: t.Optional(t.Number()),
      bathrooms: t.Optional(t.Number()),
      areaSqm: t.Optional(t.Number()),
      monthlyRent: t.Optional(t.Number({ minimum: 0 })),
      description: t.Optional(t.String()),
      isAvailable: t.Optional(t.Boolean())
    }),
    detail: {
      tags: ['Properties'],
      summary: 'Update property'
    }
  })
  .put('/:id/release', propertyController.release, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    detail: {
      tags: ['Properties'],
      summary: 'Release property (make it available by removing tenant assignment)'
    }
  })
  .delete('/:id', propertyController.delete, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    detail: {
      tags: ['Properties'],
      summary: 'Delete property'
    }
  });

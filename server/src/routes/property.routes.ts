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

// Validation schemas - aligned with DTOs for consistency
const idParamsSchema = t.Object({
  id: t.Numeric({ minimum: 1 })
});

const createPropertyBodySchema = t.Object({
  localNumber: t.Number({ minimum: 1 }),
  ubicacion: t.Union([t.Literal('BOULEVARD'), t.Literal('SAN_MARTIN')]),
  propertyType: t.String(),
  monthlyRent: t.Number({ minimum: 0 }),
  isAvailable: t.Optional(t.Boolean()),
  tenantId: t.Number({ minimum: 1 })
});

const updatePropertyBodySchema = t.Object({
  localNumber: t.Optional(t.Number({ minimum: 1 })),
  ubicacion: t.Optional(t.Union([t.Literal('BOULEVARD'), t.Literal('SAN_MARTIN')])),
  propertyType: t.Optional(t.String()),
  monthlyRent: t.Optional(t.Number({ minimum: 0 })),
  isAvailable: t.Optional(t.Boolean())
});

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
    params: idParamsSchema,
    detail: {
      tags: ['Properties'],
      summary: 'Get property by ID'
    }
  })
  .post('/', propertyController.create, {
    body: createPropertyBodySchema,
    detail: {
      tags: ['Properties'],
      summary: 'Create new property'
    }
  })
  .put('/:id', propertyController.update, {
    params: idParamsSchema,
    body: updatePropertyBodySchema,
    detail: {
      tags: ['Properties'],
      summary: 'Update property'
    }
  })
  .put('/:id/release', propertyController.release, {
    params: idParamsSchema,
    detail: {
      tags: ['Properties'],
      summary: 'Release property (make it available by removing tenant assignment)'
    }
  })
  .delete('/:id', propertyController.delete, {
    params: idParamsSchema,
    detail: {
      tags: ['Properties'],
      summary: 'Delete property'
    }
  });

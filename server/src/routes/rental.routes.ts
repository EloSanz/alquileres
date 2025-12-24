import { Elysia, t } from 'elysia';
import { RentalController } from '../controllers/rental.controller';
import { RentalService } from '../implementations/services/RentalService';
import { PrismaRentalRepository } from '../implementations/repositories/PrismaRentalRepository';
import { PrismaTenantRepository } from '../implementations/repositories/PrismaTenantRepository';
import { PrismaPropertyRepository } from '../implementations/repositories/PrismaPropertyRepository';
import { authPlugin } from '../plugins/auth.plugin';
import { JWTPayload, JWT_SECRET } from '../types/jwt.types';
import { verify as jwtVerify } from 'jsonwebtoken';
import { logError } from '../utils/logger';

// Dependency injection
const rentalRepository = new PrismaRentalRepository();
const tenantRepository = new PrismaTenantRepository();
const propertyRepository = new PrismaPropertyRepository();
const rentalService = new RentalService(rentalRepository, tenantRepository, propertyRepository);
const rentalController = new RentalController(rentalService);

export const rentalRoutes = new Elysia({ prefix: '/rentals' })
  .use(authPlugin)
  .derive(async ({ headers, request }) => {
    const authHeader = headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logError('No token provided', undefined, { route: 'rentals', method: request.method, url: request.url })
      throw new Error('No token provided')
    }

    const token = authHeader.substring(7)

    try {
      const payload = jwtVerify(token, JWT_SECRET) as JWTPayload
      return { userId: payload.userId }
    } catch (error: any) {
      logError('Token verification failed', error, { route: 'rentals', method: request.method, url: request.url })
      throw new Error('Invalid token')
    }
  })
  .get('/', rentalController.getAll, {
    detail: {
      tags: ['Rentals'],
      summary: 'Get all rentals'
    }
  })
  .get('/:id', rentalController.getById, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    detail: {
      tags: ['Rentals'],
      summary: 'Get rental by ID'
    }
  })
  .post('/', rentalController.create, {
    body: t.Object({
      tenantId: t.Number({ minimum: 1 }),
      propertyId: t.Number({ minimum: 1 }),
      startDate: t.String(),
      endDate: t.Optional(t.String()),
      monthlyRent: t.Number({ minimum: 0 }),
      depositAmount: t.Optional(t.Number({ minimum: 0 })),
      status: t.Optional(t.String()),
      notes: t.Optional(t.String())
    }),
    detail: {
      tags: ['Rentals'],
      summary: 'Create new rental'
    }
  })
  .put('/:id', rentalController.update, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    body: t.Object({
      tenantId: t.Optional(t.Number({ minimum: 1 })),
      propertyId: t.Optional(t.Number({ minimum: 1 })),
      startDate: t.Optional(t.String()),
      endDate: t.Optional(t.String()),
      monthlyRent: t.Optional(t.Number({ minimum: 0 })),
      depositAmount: t.Optional(t.Number({ minimum: 0 })),
      status: t.Optional(t.String()),
      notes: t.Optional(t.String())
    }),
    detail: {
      tags: ['Rentals'],
      summary: 'Update rental'
    }
  })
  .delete('/:id', rentalController.delete, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    detail: {
      tags: ['Rentals'],
      summary: 'Delete rental'
    }
  });

import { Elysia, t } from 'elysia';
import { RentalController } from '../controllers/rental.controller';
import { RentalService } from '../implementations/services/RentalService';
import { PrismaRentalRepository } from '../implementations/repositories/PrismaRentalRepository';
import { PrismaTenantRepository } from '../implementations/repositories/PrismaTenantRepository';
import { PrismaPropertyRepository } from '../implementations/repositories/PrismaPropertyRepository';
import { authPlugin } from '../plugins/auth.plugin';
import { JWTPayload, JWT_SECRET } from '../types/jwt.types';
import { verify as jwtVerify } from 'jsonwebtoken';

// Dependency injection
const rentalRepository = new PrismaRentalRepository();
const tenantRepository = new PrismaTenantRepository();
const propertyRepository = new PrismaPropertyRepository();
const rentalService = new RentalService(rentalRepository, tenantRepository, propertyRepository);
const rentalController = new RentalController(rentalService);

export const rentalRoutes = new Elysia({ prefix: '/rentals' })
  .use(authPlugin)
  .derive(async ({ headers }) => {
    const authHeader = headers.authorization
    console.log('[Rental Routes] Checking auth header:', authHeader ? 'present' : 'missing')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[Rental Routes] No token provided')
      throw new Error('No token provided')
    }

    const token = authHeader.substring(7)
    console.log('[Rental Routes] Token extracted, verifying...')

    try {
      const payload = jwtVerify(token, JWT_SECRET) as JWTPayload
      console.log('[Rental Routes] Token verified, userId:', payload.userId)

      return { userId: payload.userId }
    } catch (error: any) {
      console.log('[Rental Routes] Token verification failed:', error.message)
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

import { Elysia, t } from 'elysia';
import { RentalController } from '../controllers/rental.controller';
import { RentalService } from '../implementations/services/RentalService';
import { PrismaRentalRepository } from '../implementations/repositories/PrismaRentalRepository';
import { PrismaTenantRepository } from '../implementations/repositories/PrismaTenantRepository';
import { PrismaPropertyRepository } from '../implementations/repositories/PrismaPropertyRepository';
import { authPlugin } from '../plugins/auth.plugin';

// Dependency injection
const rentalRepository = new PrismaRentalRepository();
const tenantRepository = new PrismaTenantRepository();
const propertyRepository = new PrismaPropertyRepository();
const rentalService = new RentalService(rentalRepository, tenantRepository, propertyRepository);
const rentalController = new RentalController(rentalService);

export const rentalRoutes = new Elysia({ prefix: '/rentals' })
  .use(authPlugin)
  .derive(async ({ jwt, headers }) => {
    const authHeader = headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No token provided')
    }

    const token = authHeader.substring(7)
    const payload = await jwt.verify(token)
    if (!payload) throw new Error('Invalid token')

    return { userId: payload.userId as number }
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

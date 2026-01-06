import { Elysia, t } from 'elysia';
import { ServiceController } from '../controllers/service.controller';
import { ServiceService } from '../implementations/services/ServiceService';
import { PrismaServiceRepository } from '../implementations/repositories/PrismaServiceRepository';
import { authPlugin } from '../plugins/auth.plugin';
import { JWTPayload, JWT_SECRET } from '../types/jwt.types';
import { verify as jwtVerify } from 'jsonwebtoken';
import { logError } from '../utils/logger';

// Dependency injection
const serviceRepository = new PrismaServiceRepository();
const serviceService = new ServiceService(serviceRepository);
const serviceController = new ServiceController(serviceService);

// Validation schemas - aligned with DTOs for consistency
const idParamsSchema = t.Object({
  id: t.Numeric({ minimum: 1 })
});

const createServiceBodySchema = t.Object({
  propertyId: t.Union([t.Number({ minimum: 1 }), t.Null()]),
  contractId: t.Union([t.Number({ minimum: 1 }), t.Null()]),
  serviceType: t.String(),
  amount: t.Number({ minimum: 0 }),
  dueDate: t.String(),
  paidDate: t.Optional(t.Union([t.String(), t.Null()])),
  isPaid: t.Optional(t.Boolean()),
  notes: t.Optional(t.String())
});

const updateServiceBodySchema = t.Object({
  propertyId: t.Optional(t.Union([t.Number({ minimum: 1 }), t.Null()])),
  contractId: t.Optional(t.Union([t.Number({ minimum: 1 }), t.Null()])),
  serviceType: t.Optional(t.String()),
  amount: t.Optional(t.Number({ minimum: 0 })),
  dueDate: t.Optional(t.String()),
  paidDate: t.Optional(t.Union([t.String(), t.Null()])),
  isPaid: t.Optional(t.Boolean()),
  notes: t.Optional(t.String())
});

export const serviceRoutes = new Elysia({ prefix: '/services' })
  // Auth middleware removed
  .derive(async () => {
    return { userId: 1 }
  })
  .get('/', serviceController.getAll, {
    detail: {
      tags: ['Services'],
      summary: 'Get all services'
    }
  })
  .get('/:id', serviceController.getById, {
    params: idParamsSchema,
    detail: {
      tags: ['Services'],
      summary: 'Get service by ID'
    }
  })
  .post('/', serviceController.create, {
    body: createServiceBodySchema,
    detail: {
      tags: ['Services'],
      summary: 'Create new service'
    }
  })
  .put('/:id', serviceController.update, {
    params: idParamsSchema,
    body: updateServiceBodySchema,
    detail: {
      tags: ['Services'],
      summary: 'Update service'
    }
  })
  .delete('/:id', serviceController.delete, {
    params: idParamsSchema,
    detail: {
      tags: ['Services'],
      summary: 'Delete service'
    }
  });


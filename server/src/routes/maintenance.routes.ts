import { Elysia, t } from 'elysia';
import { MaintenanceController } from '../controllers/maintenance.controller';
import { MaintenanceService } from '../implementations/services/MaintenanceService';
import { PrismaMaintenanceRepository } from '../implementations/repositories/PrismaMaintenanceRepository';
import { authPlugin } from '../plugins/auth.plugin';
import { JWTPayload, JWT_SECRET } from '../types/jwt.types';
import { verify as jwtVerify } from 'jsonwebtoken';
import { logError } from '../utils/logger';

// Dependency injection
const maintenanceRepository = new PrismaMaintenanceRepository();
const maintenanceService = new MaintenanceService(maintenanceRepository);
const maintenanceController = new MaintenanceController(maintenanceService);

// Validation schemas - aligned with DTOs for consistency
const idParamsSchema = t.Object({
  id: t.Numeric({ minimum: 1 })
});

const createMaintenanceBodySchema = t.Object({
  propertyId: t.Union([t.Number({ minimum: 1 }), t.Null()]),
  contractId: t.Union([t.Number({ minimum: 1 }), t.Null()]),
  maintenanceType: t.String(),
  description: t.String({ minLength: 1 }),
  estimatedCost: t.Optional(t.Union([t.Number({ minimum: 0 }), t.Null()])),
  actualCost: t.Optional(t.Union([t.Number({ minimum: 0 }), t.Null()])),
  scheduledDate: t.Optional(t.Union([t.String(), t.Null()])),
  completedDate: t.Optional(t.Union([t.String(), t.Null()])),
  status: t.Optional(t.String()),
  notes: t.Optional(t.String())
});

const updateMaintenanceBodySchema = t.Object({
  propertyId: t.Optional(t.Union([t.Number({ minimum: 1 }), t.Null()])),
  contractId: t.Optional(t.Union([t.Number({ minimum: 1 }), t.Null()])),
  maintenanceType: t.Optional(t.String()),
  description: t.Optional(t.String({ minLength: 1 })),
  estimatedCost: t.Optional(t.Union([t.Number({ minimum: 0 }), t.Null()])),
  actualCost: t.Optional(t.Union([t.Number({ minimum: 0 }), t.Null()])),
  scheduledDate: t.Optional(t.Union([t.String(), t.Null()])),
  completedDate: t.Optional(t.Union([t.String(), t.Null()])),
  status: t.Optional(t.String()),
  notes: t.Optional(t.String())
});

export const maintenanceRoutes = new Elysia({ prefix: '/maintenances' })
  .use(authPlugin)
  .derive(async ({ headers, request }) => {
    const authHeader: string | undefined = headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logError('No token provided', undefined, { route: 'maintenances', method: request.method, url: request.url })
      throw new Error('No token provided')
    }

    const token: string = authHeader.substring(7)

    try {
      const payload = jwtVerify(token, JWT_SECRET) as JWTPayload
      return { userId: payload.userId }
    } catch (error: any) {
      logError('Token verification failed', error, { route: 'maintenances', method: request.method, url: request.url })
      throw new Error('Invalid token')
    }
  })
  .get('/', maintenanceController.getAll, {
    detail: {
      tags: ['Maintenances'],
      summary: 'Get all maintenances'
    }
  })
  .get('/:id', maintenanceController.getById, {
    params: idParamsSchema,
    detail: {
      tags: ['Maintenances'],
      summary: 'Get maintenance by ID'
    }
  })
  .post('/', maintenanceController.create, {
    body: createMaintenanceBodySchema,
    detail: {
      tags: ['Maintenances'],
      summary: 'Create new maintenance'
    }
  })
  .put('/:id', maintenanceController.update, {
    params: idParamsSchema,
    body: updateMaintenanceBodySchema,
    detail: {
      tags: ['Maintenances'],
      summary: 'Update maintenance'
    }
  })
  .delete('/:id', maintenanceController.delete, {
    params: idParamsSchema,
    detail: {
      tags: ['Maintenances'],
      summary: 'Delete maintenance'
    }
  });

import { Elysia, t } from 'elysia';
import { GuaranteeController } from '../controllers/guarantee.controller';
import { GuaranteeService } from '../implementations/services/GuaranteeService';
import { PrismaGuaranteeRepository } from '../implementations/repositories/PrismaGuaranteeRepository';
import { authPlugin } from '../plugins/auth.plugin';
import { JWTPayload, JWT_SECRET } from '../types/jwt.types';
import { verify as jwtVerify } from 'jsonwebtoken';
import { logError } from '../utils/logger';

// Dependency injection
const guaranteeRepository = new PrismaGuaranteeRepository();
const guaranteeService = new GuaranteeService(guaranteeRepository);
const guaranteeController = new GuaranteeController(guaranteeService);

// Validation schemas - aligned with DTOs for consistency
const idParamsSchema = t.Object({
  id: t.Numeric({ minimum: 1 })
});

const createGuaranteeBodySchema = t.Object({
  propertyId: t.Union([t.Number({ minimum: 1 }), t.Null()]),
  contractId: t.Union([t.Number({ minimum: 1 }), t.Null()]),
  tenantId: t.Union([t.Number({ minimum: 1 }), t.Null()]),
  guaranteeType: t.String(),
  amount: t.Number({ minimum: 0 }),
  depositDate: t.Optional(t.String()),
  returnDate: t.Optional(t.Union([t.String(), t.Null()])),
  isReturned: t.Optional(t.Boolean()),
  notes: t.Optional(t.String())
});

const updateGuaranteeBodySchema = t.Object({
  propertyId: t.Optional(t.Union([t.Number({ minimum: 1 }), t.Null()])),
  contractId: t.Optional(t.Union([t.Number({ minimum: 1 }), t.Null()])),
  tenantId: t.Optional(t.Union([t.Number({ minimum: 1 }), t.Null()])),
  guaranteeType: t.Optional(t.String()),
  amount: t.Optional(t.Number({ minimum: 0 })),
  depositDate: t.Optional(t.String()),
  returnDate: t.Optional(t.Union([t.String(), t.Null()])),
  isReturned: t.Optional(t.Boolean()),
  notes: t.Optional(t.String())
});

export const guaranteeRoutes = new Elysia({ prefix: '/guarantees' })
  .use(authPlugin)
  .derive(async ({ headers, request }) => {
    const authHeader: string | undefined = headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logError('No token provided', undefined, { route: 'guarantees', method: request.method, url: request.url })
      throw new Error('No token provided')
    }

    const token: string = authHeader.substring(7)

    try {
      const payload = jwtVerify(token, JWT_SECRET) as JWTPayload
      return { userId: payload.userId }
    } catch (error: any) {
      logError('Token verification failed', error, { route: 'guarantees', method: request.method, url: request.url })
      throw new Error('Invalid token')
    }
  })
  .get('/', guaranteeController.getAll, {
    detail: {
      tags: ['Guarantees'],
      summary: 'Get all guarantees'
    }
  })
  .get('/:id', guaranteeController.getById, {
    params: idParamsSchema,
    detail: {
      tags: ['Guarantees'],
      summary: 'Get guarantee by ID'
    }
  })
  .post('/', guaranteeController.create, {
    body: createGuaranteeBodySchema,
    detail: {
      tags: ['Guarantees'],
      summary: 'Create new guarantee'
    }
  })
  .put('/:id', guaranteeController.update, {
    params: idParamsSchema,
    body: updateGuaranteeBodySchema,
    detail: {
      tags: ['Guarantees'],
      summary: 'Update guarantee'
    }
  })
  .delete('/:id', guaranteeController.delete, {
    params: idParamsSchema,
    detail: {
      tags: ['Guarantees'],
      summary: 'Delete guarantee'
    }
  });

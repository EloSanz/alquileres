import { Elysia, t } from 'elysia';
import { TaxController } from '../controllers/tax.controller';
import { TaxService } from '../implementations/services/TaxService';
import { PrismaTaxRepository } from '../implementations/repositories/PrismaTaxRepository';
import { authPlugin } from '../plugins/auth.plugin';
import { JWTPayload, JWT_SECRET } from '../types/jwt.types';
import { verify as jwtVerify } from 'jsonwebtoken';
import { logError } from '../utils/logger';

// Dependency injection
const taxRepository = new PrismaTaxRepository();
const taxService = new TaxService(taxRepository);
const taxController = new TaxController(taxService);

// Validation schemas - aligned with DTOs for consistency
const idParamsSchema = t.Object({
  id: t.Numeric({ minimum: 1 })
});

const createTaxBodySchema = t.Object({
  propertyId: t.Union([t.Number({ minimum: 1 }), t.Null()]),
  contractId: t.Union([t.Number({ minimum: 1 }), t.Null()]),
  taxType: t.String(),
  amount: t.Number({ minimum: 0 }),
  dueDate: t.String(),
  paidDate: t.Optional(t.Union([t.String(), t.Null()])),
  isPaid: t.Optional(t.Boolean()),
  notes: t.Optional(t.String())
});

const updateTaxBodySchema = t.Object({
  propertyId: t.Optional(t.Union([t.Number({ minimum: 1 }), t.Null()])),
  contractId: t.Optional(t.Union([t.Number({ minimum: 1 }), t.Null()])),
  taxType: t.Optional(t.String()),
  amount: t.Optional(t.Number({ minimum: 0 })),
  dueDate: t.Optional(t.String()),
  paidDate: t.Optional(t.Union([t.String(), t.Null()])),
  isPaid: t.Optional(t.Boolean()),
  notes: t.Optional(t.String())
});

export const taxRoutes = new Elysia({ prefix: '/taxes' })
  .use(authPlugin)
  .derive(async ({ headers, request }) => {
    const authHeader: string | undefined = headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logError('No token provided', undefined, { route: 'taxes', method: request.method, url: request.url })
      throw new Error('No token provided')
    }

    const token: string = authHeader.substring(7)

    try {
      const payload = jwtVerify(token, JWT_SECRET) as JWTPayload
      return { userId: payload.userId }
    } catch (error: any) {
      logError('Token verification failed', error, { route: 'taxes', method: request.method, url: request.url })
      throw new Error('Invalid token')
    }
  })
  .get('/', taxController.getAll, {
    detail: {
      tags: ['Taxes'],
      summary: 'Get all taxes'
    }
  })
  .get('/:id', taxController.getById, {
    params: idParamsSchema,
    detail: {
      tags: ['Taxes'],
      summary: 'Get tax by ID'
    }
  })
  .post('/', taxController.create, {
    body: createTaxBodySchema,
    detail: {
      tags: ['Taxes'],
      summary: 'Create new tax'
    }
  })
  .put('/:id', taxController.update, {
    params: idParamsSchema,
    body: updateTaxBodySchema,
    detail: {
      tags: ['Taxes'],
      summary: 'Update tax'
    }
  })
  .delete('/:id', taxController.delete, {
    params: idParamsSchema,
    detail: {
      tags: ['Taxes'],
      summary: 'Delete tax'
    }
  });

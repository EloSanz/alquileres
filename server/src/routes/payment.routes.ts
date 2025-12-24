import { Elysia, t } from 'elysia';
import { PaymentController } from '../controllers/payment.controller';
import { PaymentService } from '../implementations/services/PaymentService';
import { PrismaPaymentRepository } from '../implementations/repositories/PrismaPaymentRepository';
import { authPlugin } from '../plugins/auth.plugin';
import { JWTPayload, JWT_SECRET } from '../types/jwt.types';
import { verify as jwtVerify } from 'jsonwebtoken';
import { logError } from '../utils/logger';

// Dependency injection
const paymentRepository = new PrismaPaymentRepository();
const paymentService = new PaymentService(paymentRepository);
const paymentController = new PaymentController(paymentService);

export const paymentRoutes = new Elysia({ prefix: '/payments' })
  .use(authPlugin)
  .derive(async ({ headers, request }) => {
    const authHeader: string | undefined = headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logError('No token provided', undefined, { route: 'payments', method: request.method, url: request.url })
      throw new Error('No token provided')
    }

    const token: string = authHeader.substring(7)

    try {
      const payload = jwtVerify(token, JWT_SECRET) as JWTPayload
      return { userId: payload.userId }
    } catch (error: any) {
      logError('Token verification failed', error, { route: 'payments', method: request.method, url: request.url })
      throw new Error('Invalid token')
    }
  })
  .get('/', paymentController.getAll, {
    detail: {
      tags: ['Payments'],
      summary: 'Get all payments'
    }
  })
  .get('/:id', paymentController.getById, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    detail: {
      tags: ['Payments'],
      summary: 'Get payment by ID'
    }
  })
  .post('/', paymentController.create, {
    body: t.Object({
      tenantId: t.Number({ minimum: 1 }),
      propertyId: t.Number({ minimum: 1 }),
      amount: t.Number({ minimum: 0 }),
      paymentDate: t.Optional(t.String()),
      dueDate: t.String(),
      notes: t.Optional(t.String())
    }),
    detail: {
      tags: ['Payments'],
      summary: 'Create new payment'
    }
  })
  .put('/:id', paymentController.update, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    body: t.Object({
      tenantId: t.Optional(t.Number({ minimum: 1 })),
      propertyId: t.Optional(t.Number({ minimum: 1 })),
      amount: t.Optional(t.Number({ minimum: 0 })),
      paymentDate: t.Optional(t.String()),
      dueDate: t.Optional(t.String()),
      notes: t.Optional(t.String())
    }),
    detail: {
      tags: ['Payments'],
      summary: 'Update payment'
    }
  })
  .delete('/:id', paymentController.delete, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    detail: {
      tags: ['Payments'],
      summary: 'Delete payment'
    }
  });

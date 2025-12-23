import { Elysia, t } from 'elysia';
import { PaymentController } from '../controllers/payment.controller';
import { PaymentService } from '../implementations/services/PaymentService';
import { PrismaPaymentRepository } from '../implementations/repositories/PrismaPaymentRepository';

// Dependency injection
const paymentRepository = new PrismaPaymentRepository();
const paymentService = new PaymentService(paymentRepository);
const paymentController = new PaymentController(paymentService);

export const paymentRoutes = new Elysia({ prefix: '/api/payments' })
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
      rentalId: t.Number({ minimum: 1 }),
      amount: t.Number({ minimum: 0 }),
      paymentDate: t.Optional(t.String()),
      dueDate: t.String(),
      paymentType: t.String(),
      status: t.Optional(t.String()),
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
      rentalId: t.Optional(t.Number({ minimum: 1 })),
      amount: t.Optional(t.Number({ minimum: 0 })),
      paymentDate: t.Optional(t.String()),
      dueDate: t.Optional(t.String()),
      paymentType: t.Optional(t.String()),
      status: t.Optional(t.String()),
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

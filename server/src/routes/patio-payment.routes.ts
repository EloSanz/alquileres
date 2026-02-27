import { Elysia, t } from 'elysia';
import { PatioPaymentController } from '../controllers/patio-payment.controller';
import { PatioPaymentService } from '../implementations/services/PatioPaymentService';
import { PrismaPatioPaymentRepository } from '../implementations/repositories/PrismaPatioPaymentRepository';

// Dependency injection
const patioPaymentRepository = new PrismaPatioPaymentRepository();
const patioPaymentService = new PatioPaymentService(patioPaymentRepository);
const patioPaymentController = new PatioPaymentController(patioPaymentService);

const idParamsSchema = t.Object({ id: t.Numeric({ minimum: 1 }) });
const tenantIdParamsSchema = t.Object({ patioTenantId: t.Numeric({ minimum: 1 }) });

const createPatioPaymentBodySchema = t.Object({
    patioTenantId: t.Numeric({ minimum: 1 }),
    monto: t.Number({ minimum: 0.01 }),
    fechaPago: t.Optional(t.String()),
    fechaVencimiento: t.String({ minLength: 1 }),
    metodoPago: t.Optional(t.String()),
    estado: t.Optional(t.String()),
    notas: t.Optional(t.String()),
    pentamontSettled: t.Optional(t.Boolean()),
    receiptImageUrl: t.Optional(t.String()),
    receiptImagePublicId: t.Optional(t.String()),
});

const updatePatioPaymentBodySchema = t.Object({
    patioTenantId: t.Optional(t.Numeric({ minimum: 1 })),
    monto: t.Optional(t.Number({ minimum: 0.01 })),
    fechaPago: t.Optional(t.String()),
    fechaVencimiento: t.Optional(t.String()),
    metodoPago: t.Optional(t.String()),
    estado: t.Optional(t.String()),
    notas: t.Optional(t.String()),
    pentamontSettled: t.Optional(t.Boolean()),
    receiptImageUrl: t.Optional(t.String()),
    receiptImagePublicId: t.Optional(t.String()),
});

export const patioPaymentRoutes = new Elysia({ prefix: '/patio-payments' })
    .derive(async () => {
        return { userId: 1 };
    })
    .get('/', patioPaymentController.getAll, {
        detail: { tags: ['PatioPayments'], summary: 'Get all patio payments' },
    })
    .get('/:id', patioPaymentController.getById, {
        params: idParamsSchema,
        detail: { tags: ['PatioPayments'], summary: 'Get patio payment by ID' },
    })
    .get('/by-tenant/:patioTenantId', patioPaymentController.getByTenantId, {
        params: tenantIdParamsSchema,
        detail: { tags: ['PatioPayments'], summary: 'Get patio payments by tenant ID' },
    })
    .post('/', patioPaymentController.create, {
        body: createPatioPaymentBodySchema,
        detail: { tags: ['PatioPayments'], summary: 'Create patio payment' },
    })
    .put('/:id', patioPaymentController.update, {
        params: idParamsSchema,
        body: updatePatioPaymentBodySchema,
        detail: { tags: ['PatioPayments'], summary: 'Update patio payment' },
    })
    .delete('/:id', patioPaymentController.delete, {
        params: idParamsSchema,
        detail: { tags: ['PatioPayments'], summary: 'Delete patio payment' },
    });

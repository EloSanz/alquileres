import { Elysia, t } from 'elysia';
import { PrismaServiceReceiptRepository } from '../implementations/repositories/PrismaServiceReceiptRepository';
import { ServiceReceiptEntity } from '../entities/ServiceReceipt.entity';

const repo = new PrismaServiceReceiptRepository();

export const serviceReceiptRoutes = new Elysia({ prefix: '/service-receipts' })
  .derive(async () => ({ userId: 1 }))
  .get('/', async () => {
    const receipts = await repo.findAll();
    return { success: true, data: receipts.map(r => r.toDTO()) };
  }, {
    detail: { tags: ['ServiceReceipts'], summary: 'Get all service receipts' }
  })
  .post('/', async ({ body }) => {
    const entity = ServiceReceiptEntity.create(body as any);
    const saved = await repo.create(entity);
    return { success: true, data: saved.toDTO() };
  }, {
    body: t.Object({
      categoryId: t.Number({ minimum: 1 }),
      tenantId: t.Optional(t.Union([t.Number(), t.Null()])),
      tenantName: t.Optional(t.Union([t.String(), t.Null()])),
      paymentDate: t.String(),
      amount: t.Optional(t.Union([t.Number({ minimum: 0 }), t.Null()])),
      receiptImageUrl: t.Optional(t.Union([t.String(), t.Null()])),
      receiptImagePublicId: t.Optional(t.Union([t.String(), t.Null()])),
      kind: t.Optional(t.Union([t.Literal('GENERATED'), t.Literal('UPLOADED')])),
      notes: t.Optional(t.Union([t.String(), t.Null()])),
    }),
    detail: { tags: ['ServiceReceipts'], summary: 'Create service receipt' }
  })
  .patch('/:id/image', async ({ params: { id }, body, set }) => {
    const existing = await repo.findById(id);
    if (!existing) {
      set.status = 404;
      return { success: false, message: 'Receipt not found' };
    }
    const updated = await repo.updateImage(id, body.receiptImageUrl, body.receiptImagePublicId ?? null);
    return { success: true, data: updated.toDTO() };
  }, {
    params: t.Object({ id: t.Numeric({ minimum: 1 }) }),
    body: t.Object({
      receiptImageUrl: t.String(),
      receiptImagePublicId: t.Optional(t.Union([t.String(), t.Null()])),
    }),
    detail: { tags: ['ServiceReceipts'], summary: 'Update receipt image' }
  })
  .delete('/:id', async ({ params: { id }, set }) => {
    const deleted = await repo.softDelete(id);
    if (!deleted) {
      set.status = 404;
      return { success: false, message: 'Receipt not found' };
    }
    return { success: true, message: 'Receipt deleted' };
  }, {
    params: t.Object({ id: t.Numeric({ minimum: 1 }) }),
    detail: { tags: ['ServiceReceipts'], summary: 'Soft delete receipt' }
  });

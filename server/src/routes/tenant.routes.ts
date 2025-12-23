import { Elysia, t } from 'elysia';
import { TenantController } from '../controllers/tenant.controller';
import { TenantService } from '../implementations/services/TenantService';
import { PrismaTenantRepository } from '../implementations/repositories/PrismaTenantRepository';

// Dependency injection
const tenantRepository = new PrismaTenantRepository();
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService);

export const tenantRoutes = new Elysia({ prefix: '/api/tenants' })
  .derive(async ({ getCurrentUserId }) => ({
    userId: await getCurrentUserId()
  }))
  .get('/', tenantController.getAll, {
    detail: {
      tags: ['Tenants'],
      summary: 'Get all tenants'
    }
  })
  .get('/:id', tenantController.getById, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    detail: {
      tags: ['Tenants'],
      summary: 'Get tenant by ID'
    }
  })
  .get('/email/:email', tenantController.getByEmail, {
    params: t.Object({
      email: t.String({ format: 'email' })
    }),
    detail: {
      tags: ['Tenants'],
      summary: 'Get tenant by email'
    }
  })
  .get('/document/:documentId', tenantController.getByDocumentId, {
    params: t.Object({
      documentId: t.String({ minLength: 5 })
    }),
    detail: {
      tags: ['Tenants'],
      summary: 'Get tenant by document ID'
    }
  })
  .post('/', tenantController.create, {
    body: t.Object({
      firstName: t.String({ minLength: 2 }),
      lastName: t.String({ minLength: 2 }),
      email: t.String({ format: 'email' }),
      phone: t.Optional(t.String()),
      documentId: t.String({ minLength: 5 }),
      address: t.Optional(t.String()),
      birthDate: t.Optional(t.String())
    }),
    detail: {
      tags: ['Tenants'],
      summary: 'Create new tenant'
    }
  })
  .put('/:id', tenantController.update, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    body: t.Object({
      firstName: t.Optional(t.String({ minLength: 2 })),
      lastName: t.Optional(t.String({ minLength: 2 })),
      email: t.Optional(t.String({ format: 'email' })),
      phone: t.Optional(t.String()),
      address: t.Optional(t.String()),
      birthDate: t.Optional(t.String())
    }),
    detail: {
      tags: ['Tenants'],
      summary: 'Update tenant'
    }
  })
  .delete('/:id', tenantController.delete, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    detail: {
      tags: ['Tenants'],
      summary: 'Delete tenant'
    }
  });

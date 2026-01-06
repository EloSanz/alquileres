import { Elysia, t } from 'elysia';
import { ContractController } from '../controllers/contract.controller';
import { ContractService } from '../implementations/services/ContractService';
import { PrismaContractRepository } from '../implementations/repositories/PrismaContractRepository';
import { PrismaPaymentRepository } from '../implementations/repositories/PrismaPaymentRepository';
import { authPlugin } from '../plugins/auth.plugin';
import { JWTPayload, JWT_SECRET } from '../types/jwt.types';
import { verify as jwtVerify } from 'jsonwebtoken';
import { logError } from '../utils/logger';

// Dependency injection
const contractRepository = new PrismaContractRepository();
const paymentRepository = new PrismaPaymentRepository();
const contractService = new ContractService(contractRepository, paymentRepository);
const contractController = new ContractController(contractService);

// Validation schemas - aligned with DTOs for consistency
const idParamsSchema = t.Object({
  id: t.Numeric({ minimum: 1 })
});

const tenantIdParamsSchema = t.Object({
  tenantId: t.Numeric({ minimum: 1 })
});

const propertyIdParamsSchema = t.Object({
  propertyId: t.Numeric({ minimum: 1 })
});

const createContractBodySchema = t.Object({
  tenantId: t.Number({ minimum: 1 }),
  propertyId: t.Number({ minimum: 1 }),
  startDate: t.String(),
  monthlyRent: t.Number({ minimum: 0 }),
  endDate: t.Optional(t.String())
});

const updateContractBodySchema = t.Object({
  tenantId: t.Optional(t.Number({ minimum: 1 })),
  propertyId: t.Optional(t.Number({ minimum: 1 })),
  startDate: t.Optional(t.String()),
  monthlyRent: t.Optional(t.Number({ minimum: 0 })),
  status: t.Optional(t.String())
});

export const contractRoutes = new Elysia({ prefix: '/contracts' })
  // Auth middleware removed
  .derive(async () => {
    return { userId: 1 }
  })
  .get('/', contractController.getAll, {
    detail: {
      tags: ['Contracts'],
      summary: 'Get all contracts'
    }
  })
  .get('/:id', contractController.getById, {
    params: idParamsSchema,
    detail: {
      tags: ['Contracts'],
      summary: 'Get contract by ID'
    }
  })
  .get('/:id/progress', contractController.getProgress, {
    params: idParamsSchema,
    detail: {
      tags: ['Contracts'],
      summary: 'Get contract payment progress'
    }
  })
  .get('/tenant/:tenantId/active', contractController.getActiveByTenant, {
    params: tenantIdParamsSchema,
    detail: {
      tags: ['Contracts'],
      summary: 'Get active contract by tenant ID'
    }
  })
  .get('/property/:propertyId/active', contractController.getActiveByProperty, {
    params: propertyIdParamsSchema,
    detail: {
      tags: ['Contracts'],
      summary: 'Get active contract by property ID'
    }
  })
  .post('/', contractController.create, {
    body: createContractBodySchema,
    detail: {
      tags: ['Contracts'],
      summary: 'Create new contract'
    }
  })
  .put('/:id', async ({ params, body, userId }) => {
    const updateData: any = {};
    if (body.tenantId !== undefined) updateData.tenantId = body.tenantId;
    if (body.propertyId !== undefined) updateData.propertyId = body.propertyId;
    if (body.startDate !== undefined) updateData.startDate = body.startDate;
    if (body.monthlyRent !== undefined) updateData.monthlyRent = body.monthlyRent;
    if (body.status !== undefined) updateData.status = body.status;
    return contractController.update({ params: { id: params.id }, body: updateData, userId });
  }, {
    params: idParamsSchema,
    body: updateContractBodySchema,
    detail: {
      tags: ['Contracts'],
      summary: 'Update contract'
    }
  })
  .delete('/:id', contractController.delete, {
    params: idParamsSchema,
    detail: {
      tags: ['Contracts'],
      summary: 'Delete contract'
    }
  });


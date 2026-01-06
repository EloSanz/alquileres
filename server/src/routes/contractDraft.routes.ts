import { Elysia, t } from 'elysia';
import { ContractDraftController } from '../controllers/contractDraft.controller';
import { ContractDraftService } from '../implementations/services/ContractDraftService';
import { PrismaContractDraftRepository } from '../implementations/repositories/PrismaContractDraftRepository';
import { authPlugin } from '../plugins/auth.plugin';
import { JWTPayload, JWT_SECRET } from '../types/jwt.types';
import { verify as jwtVerify } from 'jsonwebtoken';
import { logError } from '../utils/logger';

// Dependency injection
const contractDraftRepository = new PrismaContractDraftRepository();
const contractDraftService = new ContractDraftService(contractDraftRepository);
const contractDraftController = new ContractDraftController(contractDraftService);

// Validation schemas
const idParamsSchema = t.Object({
  id: t.Numeric({ minimum: 1 })
});

const createContractDraftBodySchema = t.Object({
  name: t.String({ minLength: 3 }),
  data: t.Any() // JSON data - validated at service level
});

const updateContractDraftBodySchema = t.Object({
  name: t.Optional(t.String({ minLength: 3 })),
  data: t.Optional(t.Any())
});

export const contractDraftRoutes = new Elysia({ prefix: '/contract-drafts' })
  // Auth middleware removed
  .derive(async () => {
    return { userId: 1 }
  })
  .get('/', contractDraftController.getAll, {
    detail: {
      tags: ['Contract Drafts'],
      summary: 'Get all contract drafts'
    }
  })
  .get('/:id', contractDraftController.getById, {
    params: idParamsSchema,
    detail: {
      tags: ['Contract Drafts'],
      summary: 'Get contract draft by ID'
    }
  })
  .post('/', contractDraftController.create, {
    body: createContractDraftBodySchema,
    detail: {
      tags: ['Contract Drafts'],
      summary: 'Create new contract draft'
    }
  })
  .put('/:id', contractDraftController.update, {
    params: idParamsSchema,
    body: updateContractDraftBodySchema,
    detail: {
      tags: ['Contract Drafts'],
      summary: 'Update contract draft'
    }
  })
  .delete('/:id', contractDraftController.delete, {
    params: idParamsSchema,
    detail: {
      tags: ['Contract Drafts'],
      summary: 'Delete contract draft'
    }
  });


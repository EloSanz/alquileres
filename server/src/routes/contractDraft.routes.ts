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
  .use(authPlugin)
  .derive(async ({ headers, request }) => {
    const authHeader: string | undefined = headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logError('No token provided', undefined, { route: 'contract-drafts', method: request.method, url: request.url });
      throw new Error('No token provided');
    }

    const token: string = authHeader.substring(7);

    try {
      const payload = jwtVerify(token, JWT_SECRET) as JWTPayload;
      return { userId: payload.userId };
    } catch (error: any) {
      logError('Token verification failed', error, { route: 'contract-drafts', method: request.method, url: request.url });
      throw new Error('Invalid token');
    }
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


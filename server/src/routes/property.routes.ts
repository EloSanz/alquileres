import { Elysia, t } from 'elysia';
import { PropertyController } from '../controllers/property.controller';
import { PropertyService } from '../implementations/services/PropertyService';
import { PrismaPropertyRepository } from '../implementations/repositories/PrismaPropertyRepository';

// Dependency injection
const propertyRepository = new PrismaPropertyRepository();
const propertyService = new PropertyService(propertyRepository);
const propertyController = new PropertyController(propertyService);

export const propertyRoutes = new Elysia({ prefix: '/api/properties' })
  .guard({
    beforeHandle: async ({ jwt, headers, set }) => {
      const authHeader = headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401
        return {
          success: false,
          message: 'No token provided',
          statusCode: 401
        }
      }

      const token = authHeader.substring(7)
      const payload = await jwt.verify(token)
      if (!payload) {
        set.status = 401
        return {
          success: false,
          message: 'Invalid token',
          statusCode: 401
        }
      }

      // Adjuntar userId al contexto
      (set as any).userId = payload.userId as number
    }
  })
  .derive((context) => ({
    userId: (context.set as any).userId
  }))
  .get('/', propertyController.getAll, {
    detail: {
      tags: ['Properties'],
      summary: 'Get all properties'
    }
  })
  .get('/:id', propertyController.getById, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    detail: {
      tags: ['Properties'],
      summary: 'Get property by ID'
    }
  })
  .post('/', propertyController.create, {
    body: t.Object({
      name: t.String({ minLength: 2 }),
      address: t.String({ minLength: 5 }),
      city: t.String({ minLength: 2 }),
      state: t.String({ minLength: 2 }),
      zipCode: t.Optional(t.String()),
      propertyType: t.String(),
      bedrooms: t.Optional(t.Number()),
      bathrooms: t.Optional(t.Number()),
      areaSqm: t.Optional(t.Number()),
      monthlyRent: t.Number({ minimum: 0 }),
      description: t.Optional(t.String()),
      isAvailable: t.Optional(t.Boolean())
    }),
    detail: {
      tags: ['Properties'],
      summary: 'Create new property'
    }
  })
  .put('/:id', propertyController.update, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    body: t.Object({
      name: t.Optional(t.String({ minLength: 2 })),
      address: t.Optional(t.String({ minLength: 5 })),
      city: t.Optional(t.String({ minLength: 2 })),
      state: t.Optional(t.String({ minLength: 2 })),
      zipCode: t.Optional(t.String()),
      propertyType: t.Optional(t.String()),
      bedrooms: t.Optional(t.Number()),
      bathrooms: t.Optional(t.Number()),
      areaSqm: t.Optional(t.Number()),
      monthlyRent: t.Optional(t.Number({ minimum: 0 })),
      description: t.Optional(t.String()),
      isAvailable: t.Optional(t.Boolean())
    }),
    detail: {
      tags: ['Properties'],
      summary: 'Update property'
    }
  })
  .delete('/:id', propertyController.delete, {
    params: t.Object({
      id: t.Numeric({ minimum: 1 })
    }),
    detail: {
      tags: ['Properties'],
      summary: 'Delete property'
    }
  });

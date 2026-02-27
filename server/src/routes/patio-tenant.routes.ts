import { Elysia, t } from 'elysia';
import { PatioTenantController } from '../controllers/patio-tenant.controller';
import { PatioTenantService } from '../implementations/services/PatioTenantService';
import { PrismaPatioTenantRepository } from '../implementations/repositories/PrismaPatioTenantRepository';

// Dependency injection
const patioTenantRepository = new PrismaPatioTenantRepository();
const patioTenantService = new PatioTenantService(patioTenantRepository);
const patioTenantController = new PatioTenantController(patioTenantService);

const idParamsSchema = t.Object({ id: t.Numeric({ minimum: 1 }) });

const createPatioTenantBodySchema = t.Object({
    nombre: t.String({ minLength: 2 }),
    nombreComercial: t.Optional(t.String()),
    razonSocial: t.Optional(t.String()),
    apodo: t.Optional(t.String()),
    numerosLocales: t.String({ minLength: 1 }),
    telefono: t.Optional(t.String()),
    rubro: t.Optional(t.String()),
    montoAlquiler: t.Optional(t.Number()),
    fechaIngreso: t.Optional(t.String()),
    estadoPago: t.Optional(t.String()),
});

const updatePatioTenantBodySchema = t.Object({
    nombre: t.Optional(t.String({ minLength: 2 })),
    nombreComercial: t.Optional(t.String()),
    razonSocial: t.Optional(t.String()),
    apodo: t.Optional(t.String()),
    numerosLocales: t.Optional(t.String()),
    telefono: t.Optional(t.String()),
    rubro: t.Optional(t.String()),
    montoAlquiler: t.Optional(t.Number()),
    fechaIngreso: t.Optional(t.String()),
    estadoPago: t.Optional(t.String()),
});

export const patioTenantRoutes = new Elysia({ prefix: '/patio-tenants' })
    .derive(async () => {
        return { userId: 1 };
    })
    .get('/', patioTenantController.getAll, {
        detail: { tags: ['PatioTenants'], summary: 'Get all patio tenants' },
    })
    .get('/:id', patioTenantController.getById, {
        params: idParamsSchema,
        detail: { tags: ['PatioTenants'], summary: 'Get patio tenant by ID' },
    })
    .post('/', patioTenantController.create, {
        body: createPatioTenantBodySchema,
        detail: { tags: ['PatioTenants'], summary: 'Create patio tenant' },
    })
    .put('/:id', patioTenantController.update, {
        params: idParamsSchema,
        body: updatePatioTenantBodySchema,
        detail: { tags: ['PatioTenants'], summary: 'Update patio tenant' },
    })
    .delete('/:id', patioTenantController.delete, {
        params: idParamsSchema,
        detail: { tags: ['PatioTenants'], summary: 'Delete patio tenant' },
    });

import { Elysia } from 'elysia';
import { PrismaServiceCategoryRepository } from '../implementations/repositories/PrismaServiceCategoryRepository';

const repo = new PrismaServiceCategoryRepository();

export const serviceCategoryRoutes = new Elysia({ prefix: '/service-categories' })
  .get('/', async () => {
    const categories = await repo.findAll();
    return { success: true, data: categories };
  }, {
    detail: { tags: ['ServiceCategories'], summary: 'Get all service categories' }
  });

import { prisma } from '../../lib/prisma';

export class PrismaServiceCategoryRepository {
  async findAll(): Promise<{ id: number; name: string; label: string }[]> {
    return prisma.serviceCategory.findMany({ orderBy: { id: 'asc' } });
  }
}

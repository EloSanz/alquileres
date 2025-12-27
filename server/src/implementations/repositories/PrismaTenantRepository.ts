import { ITenantRepository } from '../../interfaces/repositories/ITenantRepository';
import { TenantEntity } from '../../entities/Tenant.entity';
import { prisma } from '../../lib/prisma';

export class PrismaTenantRepository implements ITenantRepository {
  async findAll(): Promise<TenantEntity[]> {
    const tenants = await prisma.tenant.findMany({
      orderBy: { id: 'asc' }
    });
    return tenants.map(tenant => TenantEntity.fromPrisma(tenant));
  }

  async findById(id: number): Promise<TenantEntity | null> {
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    return tenant ? TenantEntity.fromPrisma(tenant) : null;
  }


  async findByDocumentId(documentId: string): Promise<TenantEntity | null> {
    const tenant = await prisma.tenant.findUnique({ where: { documentId } });
    return tenant ? TenantEntity.fromPrisma(tenant) : null;
  }

  async create(tenant: TenantEntity): Promise<TenantEntity> {
    const data = tenant.toPrisma();
    delete (data as any).id; // Remove id for creation
    const created = await prisma.tenant.create({ data });
    return TenantEntity.fromPrisma(created);
  }

  async update(id: number, tenant: TenantEntity): Promise<TenantEntity> {
    const data = tenant.toPrisma();
    delete (data as any).id; // Don't update id
    delete (data as any).createdAt; // Don't update createdAt
    const updated = await prisma.tenant.update({ where: { id }, data });
    return TenantEntity.fromPrisma(updated);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.tenant.delete({ where: { id } });
      return true; // Successfully deleted
    } catch (error: any) {
      // If tenant doesn't exist, Prisma throws an error
      if (error.code === 'P2025') {
        return false; // Not found
      }
      throw error; // Re-throw other errors
    }
  }
}

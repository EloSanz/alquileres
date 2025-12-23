import { ITenantRepository } from '../../interfaces/repositories/ITenantRepository';
import { TenantEntity } from '../../entities/Tenant.entity';

export class PrismaTenantRepository implements ITenantRepository {
  async findAll(): Promise<TenantEntity[]> {
    // TODO: Implement with actual Prisma client
    // const tenants = await prisma.tenant.findMany({
    //   orderBy: { createdAt: 'desc' }
    // });
    // return tenants.map(tenant => TenantEntity.fromPrisma(tenant));
    return [];
  }

  async findById(id: number): Promise<TenantEntity | null> {
    // TODO: Implement with actual Prisma client
    // const tenant = await prisma.tenant.findUnique({ where: { id } });
    // return tenant ? TenantEntity.fromPrisma(tenant) : null;
    return null;
  }

  async findByEmail(email: string): Promise<TenantEntity | null> {
    // TODO: Implement with actual Prisma client
    // const tenant = await prisma.tenant.findUnique({ where: { email } });
    // return tenant ? TenantEntity.fromPrisma(tenant) : null;
    return null;
  }

  async findByDocumentId(documentId: string): Promise<TenantEntity | null> {
    // TODO: Implement with actual Prisma client
    // const tenant = await prisma.tenant.findUnique({ where: { documentId } });
    // return tenant ? TenantEntity.fromPrisma(tenant) : null;
    return null;
  }

  async create(tenant: TenantEntity): Promise<TenantEntity> {
    // TODO: Implement with actual Prisma client
    // const data = tenant.toPrisma();
    // delete (data as any).id;
    // const created = await prisma.tenant.create({ data });
    // return TenantEntity.fromPrisma(created);

    // Mock implementation for now
    const newTenant = new TenantEntity(
      Date.now(), // Mock ID
      tenant.firstName,
      tenant.lastName,
      tenant.email,
      tenant.phone,
      tenant.documentId,
      tenant.address,
      tenant.birthDate,
      new Date(),
      new Date()
    );
    return newTenant;
  }

  async update(id: number, tenant: TenantEntity): Promise<TenantEntity> {
    // TODO: Implement with actual Prisma client
    // const data = tenant.toPrisma();
    // delete (data as any).id;
    // delete (data as any).createdAt;
    // const updated = await prisma.tenant.update({ where: { id }, data });
    // return TenantEntity.fromPrisma(updated);

    // Mock implementation for now
    const updatedTenant = new TenantEntity(
      id,
      tenant.firstName,
      tenant.lastName,
      tenant.email,
      tenant.phone,
      tenant.documentId,
      tenant.address,
      tenant.birthDate,
      tenant.createdAt,
      new Date()
    );
    return updatedTenant;
  }

  async delete(id: number): Promise<void> {
    // TODO: Implement with actual Prisma client
    // await prisma.tenant.delete({ where: { id } });
  }
}

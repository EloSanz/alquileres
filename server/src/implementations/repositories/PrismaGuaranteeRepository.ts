import { IGuaranteeRepository } from '../../interfaces/repositories/IGuaranteeRepository';
import { GuaranteeEntity } from '../../entities/Guarantee.entity';
import { prisma } from '../../lib/prisma';

export class PrismaGuaranteeRepository implements IGuaranteeRepository {
  async findAll(): Promise<GuaranteeEntity[]> {
    const guarantees = await prisma.guarantee.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return guarantees.map(guarantee => GuaranteeEntity.fromPrisma(guarantee));
  }

  async findById(id: number): Promise<GuaranteeEntity | null> {
    const guarantee = await prisma.guarantee.findUnique({
      where: { id }
    });
    return guarantee ? GuaranteeEntity.fromPrisma(guarantee) : null;
  }

  async findByPropertyId(propertyId: number): Promise<GuaranteeEntity[]> {
    const guarantees = await prisma.guarantee.findMany({
      where: { propertyId },
      orderBy: { depositDate: 'desc' }
    });
    return guarantees.map(guarantee => GuaranteeEntity.fromPrisma(guarantee));
  }

  async findByContractId(contractId: number): Promise<GuaranteeEntity[]> {
    const guarantees = await prisma.guarantee.findMany({
      where: { contractId },
      orderBy: { depositDate: 'desc' }
    });
    return guarantees.map(guarantee => GuaranteeEntity.fromPrisma(guarantee));
  }

  async findByTenantId(tenantId: number): Promise<GuaranteeEntity[]> {
    const guarantees = await prisma.guarantee.findMany({
      where: { tenantId },
      orderBy: { depositDate: 'desc' }
    });
    return guarantees.map(guarantee => GuaranteeEntity.fromPrisma(guarantee));
  }

  async create(entity: GuaranteeEntity): Promise<GuaranteeEntity> {
    const data = entity.toPrisma();
    delete (data as any).id;
    const guarantee = await prisma.guarantee.create({
      data: data as any
    });
    return GuaranteeEntity.fromPrisma(guarantee);
  }

  async update(entity: GuaranteeEntity): Promise<GuaranteeEntity> {
    const data = entity.toPrisma();
    delete (data as any).id;
    delete (data as any).createdAt;
    delete (data as any).propertyId;
    delete (data as any).contractId;
    delete (data as any).tenantId;
    const guarantee = await prisma.guarantee.update({
      where: { id: entity.id! },
      data: data as any
    });
    return GuaranteeEntity.fromPrisma(guarantee);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.guarantee.delete({
        where: { id }
      });
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}

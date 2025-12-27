import { IContractRepository } from '../../interfaces/repositories/IContractRepository';
import { ContractEntity } from '../../entities/Contract.entity';
import { prisma } from '../../lib/prisma';

export class PrismaContractRepository implements IContractRepository {
  async findAll(): Promise<ContractEntity[]> {
    const contracts = await prisma.contract.findMany({
      include: {
        tenant: true,
        property: true
      },
      orderBy: { id: 'asc' }
    });
    return contracts.map(contract => ContractEntity.fromPrisma(contract));
  }

  async findById(id: number): Promise<ContractEntity | null> {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        tenant: true,
        property: true
      }
    });
    return contract ? ContractEntity.fromPrisma(contract) : null;
  }

  async findByTenantId(tenantId: number): Promise<ContractEntity[]> {
    const contracts = await prisma.contract.findMany({
      where: { tenantId },
      orderBy: { id: 'asc' }
    });
    return contracts.map(contract => ContractEntity.fromPrisma(contract));
  }

  async findByPropertyId(propertyId: number): Promise<ContractEntity[]> {
    const contracts = await prisma.contract.findMany({
      where: { propertyId },
      orderBy: { id: 'asc' }
    });
    return contracts.map(contract => ContractEntity.fromPrisma(contract));
  }

  async findActiveByTenantId(tenantId: number): Promise<ContractEntity | null> {
    const contract = await prisma.contract.findFirst({
      where: {
        tenantId,
        status: 'ACTIVE'
      },
      orderBy: { id: 'asc' }
    });
    return contract ? ContractEntity.fromPrisma(contract) : null;
  }

  async findActiveByPropertyId(propertyId: number): Promise<ContractEntity | null> {
    const contract = await prisma.contract.findFirst({
      where: {
        propertyId,
        status: 'ACTIVE'
      },
      orderBy: { id: 'asc' }
    });
    return contract ? ContractEntity.fromPrisma(contract) : null;
  }

  async create(entity: ContractEntity): Promise<ContractEntity> {
    const data = entity.toPrisma();
    delete (data as any).id; // Remove id for creation
    const created = await prisma.contract.create({ data: data as any });
    return ContractEntity.fromPrisma(created);
  }

  async update(entity: ContractEntity): Promise<ContractEntity> {
    const data = entity.toPrisma();
    delete (data as any).id; // Don't update id
    delete (data as any).createdAt; // Don't update createdAt
    const updated = await prisma.contract.update({
      where: { id: entity.id! },
      data: data as any // Use any to allow null values
    });
    return ContractEntity.fromPrisma(updated);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.contract.delete({ where: { id } });
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return false; // Not found
      }
      throw error;
    }
  }
}


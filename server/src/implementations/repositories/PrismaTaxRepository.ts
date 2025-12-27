import { ITaxRepository } from '../../interfaces/repositories/ITaxRepository';
import { TaxEntity } from '../../entities/Tax.entity';
import { prisma } from '../../lib/prisma';

export class PrismaTaxRepository implements ITaxRepository {
  async findAll(): Promise<TaxEntity[]> {
    const taxes = await prisma.tax.findMany({
      orderBy: { id: 'asc' }
    });
    return taxes.map(tax => TaxEntity.fromPrisma(tax));
  }

  async findById(id: number): Promise<TaxEntity | null> {
    const tax = await prisma.tax.findUnique({
      where: { id }
    });
    return tax ? TaxEntity.fromPrisma(tax) : null;
  }

  async findByPropertyId(propertyId: number): Promise<TaxEntity[]> {
    const taxes = await prisma.tax.findMany({
      where: { propertyId },
      orderBy: { dueDate: 'desc' }
    });
    return taxes.map(tax => TaxEntity.fromPrisma(tax));
  }

  async findByContractId(contractId: number): Promise<TaxEntity[]> {
    const taxes = await prisma.tax.findMany({
      where: { contractId },
      orderBy: { dueDate: 'desc' }
    });
    return taxes.map(tax => TaxEntity.fromPrisma(tax));
  }

  async create(entity: TaxEntity): Promise<TaxEntity> {
    const data = entity.toPrisma();
    delete (data as any).id;
    const tax = await prisma.tax.create({
      data: data as any
    });
    return TaxEntity.fromPrisma(tax);
  }

  async update(entity: TaxEntity): Promise<TaxEntity> {
    const data = entity.toPrisma();
    delete (data as any).id;
    delete (data as any).createdAt;
    delete (data as any).propertyId;
    delete (data as any).contractId;
    const tax = await prisma.tax.update({
      where: { id: entity.id! },
      data: data as any
    });
    return TaxEntity.fromPrisma(tax);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.tax.delete({
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

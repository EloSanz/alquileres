import { ServiceReceiptEntity } from '../../entities/ServiceReceipt.entity';
import { prisma } from '../../lib/prisma';

export class PrismaServiceReceiptRepository {
  async findAll(): Promise<ServiceReceiptEntity[]> {
    const rows = await prisma.serviceReceipt.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
    return rows.map(ServiceReceiptEntity.fromPrisma);
  }

  async findById(id: number): Promise<ServiceReceiptEntity | null> {
    const row = await prisma.serviceReceipt.findFirst({
      where: { id, deletedAt: null },
      include: { category: true },
    });
    return row ? ServiceReceiptEntity.fromPrisma(row) : null;
  }

  async create(entity: ServiceReceiptEntity): Promise<ServiceReceiptEntity> {
    const row = await prisma.serviceReceipt.create({
      data: {
        categoryId: entity.categoryId,
        tenantId: entity.tenantId,
        tenantName: entity.tenantName,
        paymentDate: entity.paymentDate,
        amount: entity.amount,
        receiptImageUrl: entity.receiptImageUrl,
        receiptImagePublicId: entity.receiptImagePublicId,
        kind: entity.kind,
        notes: entity.notes,
      },
      include: { category: true },
    });
    return ServiceReceiptEntity.fromPrisma(row);
  }

  async updateImage(id: number, receiptImageUrl: string, receiptImagePublicId: string | null): Promise<ServiceReceiptEntity> {
    const row = await prisma.serviceReceipt.update({
      where: { id },
      data: { receiptImageUrl, receiptImagePublicId },
      include: { category: true },
    });
    return ServiceReceiptEntity.fromPrisma(row);
  }

  async softDelete(id: number): Promise<boolean> {
    try {
      await prisma.serviceReceipt.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') return false;
      throw error;
    }
  }
}

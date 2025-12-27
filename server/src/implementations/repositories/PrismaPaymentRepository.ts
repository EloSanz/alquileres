import { IPaymentRepository } from '../../interfaces/repositories/IPaymentRepository';
import { PaymentEntity } from '../../entities/Payment.entity';
import { prisma } from '../../lib/prisma';
import { logInfo, logDebug, logError } from '../../utils/logger';

export class PrismaPaymentRepository implements IPaymentRepository {
  async findAll(): Promise<PaymentEntity[]> {
    const payments = await prisma.payment.findMany({
      include: {
        tenant: true
      },
      orderBy: { id: 'asc' }
    });
    return payments.map(payment => PaymentEntity.fromPrisma(payment));
  }

  async findById(id: number): Promise<PaymentEntity | null> {
    const payment = await prisma.payment.findUnique({
      where: { id }
    });
    return payment ? PaymentEntity.fromPrisma(payment) : null;
  }

  async findByTenantId(tenantId: number): Promise<PaymentEntity[]> {
    const payments = await prisma.payment.findMany({
      where: { tenantId },
      include: {
        tenant: true
      },
      orderBy: { paymentDate: 'desc' }
    });
    return payments.map(payment => PaymentEntity.fromPrisma(payment));
  }

  async findByContractId(contractId: number): Promise<PaymentEntity[]> {
    const payments = await prisma.payment.findMany({
      where: { contractId },
      include: {
        tenant: true
      },
      orderBy: { monthNumber: 'asc' }
    });
    return payments.map(payment => PaymentEntity.fromPrisma(payment));
  }

  async create(entity: PaymentEntity): Promise<PaymentEntity> {
    const data = entity.toPrisma();
    // Remove id for creation since it's auto-generated
    delete (data as any).id;
    // Exclude receiptImageUrl - not in Prisma schema yet (will be added in future migration)
    delete (data as any).receiptImageUrl;

    const payment = await prisma.payment.create({
      data: data as any
    });
    return PaymentEntity.fromPrisma(payment);
  }

  async update(entity: PaymentEntity): Promise<PaymentEntity> {
    const data = entity.toPrisma();
    delete (data as any).id; // Don't update id
    delete (data as any).createdAt; // Don't update createdAt
    // Exclude relation fields - Prisma handles these through relations, not direct field updates
    delete (data as any).tenantId;
    delete (data as any).propertyId;
    delete (data as any).contractId;
    // Exclude receiptImageUrl - not in Prisma schema yet (will be added in future migration)
    delete (data as any).receiptImageUrl;
    
    const payment = await prisma.payment.update({
      where: { id: entity.id! },
      data: data as any // Allow null values
    });
    
    return PaymentEntity.fromPrisma(payment);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.payment.delete({
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

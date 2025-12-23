import { IPaymentRepository } from '../../interfaces/repositories/IPaymentRepository';
import { PaymentEntity } from '../../entities/Payment.entity';
import { prisma } from '../../lib/prisma';

export class PrismaPaymentRepository implements IPaymentRepository {
  async findAll(): Promise<PaymentEntity[]> {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return payments.map(payment => PaymentEntity.fromPrisma(payment));
  }

  async findById(id: number): Promise<PaymentEntity | null> {
    const payment = await prisma.payment.findUnique({
      where: { id }
    });
    return payment ? PaymentEntity.fromPrisma(payment) : null;
  }

  async create(entity: PaymentEntity): Promise<PaymentEntity> {
    const payment = await prisma.payment.create({
      data: entity.toPrisma()
    });
    return PaymentEntity.fromPrisma(payment);
  }

  async update(entity: PaymentEntity): Promise<PaymentEntity> {
    const payment = await prisma.payment.update({
      where: { id: entity.id! },
      data: entity.toPrisma()
    });
    return PaymentEntity.fromPrisma(payment);
  }

  async delete(id: number): Promise<void> {
    await prisma.payment.delete({
      where: { id }
    });
  }
}

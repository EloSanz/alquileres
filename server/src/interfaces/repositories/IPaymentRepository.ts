import { PaymentEntity } from '../../entities/Payment.entity';

export interface IPaymentRepository {
  findAll(): Promise<PaymentEntity[]>;
  findById(id: number): Promise<PaymentEntity | null>;
  findByTenantId(tenantId: number): Promise<PaymentEntity[]>;
  create(entity: PaymentEntity): Promise<PaymentEntity>;
  update(entity: PaymentEntity): Promise<PaymentEntity>;
  delete(id: number): Promise<boolean>;
}

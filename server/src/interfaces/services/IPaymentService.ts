import { PaymentDTO, CreatePaymentDTO, UpdatePaymentDTO } from '../../dtos/payment.dto';

export interface IPaymentService {
  getAllPayments(userId: number): Promise<PaymentDTO[]>;
  getPaymentById(id: number, userId: number): Promise<PaymentDTO>;
  getPaymentsByTenantId(tenantId: number, userId: number): Promise<PaymentDTO[]>;
  createPayment(data: CreatePaymentDTO, userId: number): Promise<PaymentDTO>;
  updatePayment(id: number, data: UpdatePaymentDTO, userId: number): Promise<PaymentDTO>;
  deletePayment(id: number, userId: number): Promise<boolean>;
}

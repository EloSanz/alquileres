import { IPaymentService } from '../interfaces/services/IPaymentService';
import { CreatePaymentDTO, UpdatePaymentDTO } from '../dtos/payment.dto';

export class PaymentController {
  constructor(private paymentService: IPaymentService) {}

  getAll = async ({ getCurrentUserId }: { getCurrentUserId: () => Promise<number> }) => {
    const userId = await getCurrentUserId();
    const payments = await this.paymentService.getAllPayments(userId);
    return {
      success: true,
      message: 'Payments retrieved successfully',
      data: payments,
    };
  };

  getById = async ({
    params: { id },
    getCurrentUserId,
  }: {
    params: { id: number };
    getCurrentUserId: () => Promise<number>;
  }) => {
    const userId = await getCurrentUserId();
    const payment = await this.paymentService.getPaymentById(id, userId);
    return {
      success: true,
      message: 'Payment retrieved successfully',
      data: payment,
    };
  };

  create = async ({
    body,
    getCurrentUserId,
  }: {
    body: CreatePaymentDTO;
    getCurrentUserId: () => Promise<number>;
  }) => {
    const userId = await getCurrentUserId();
    const payment = await this.paymentService.createPayment(body, userId);
    return {
      success: true,
      message: 'Payment created successfully',
      data: payment,
    };
  };

  update = async ({
    params: { id },
    body,
    getCurrentUserId,
  }: {
    params: { id: number };
    body: UpdatePaymentDTO;
    getCurrentUserId: () => Promise<number>;
  }) => {
    const userId = await getCurrentUserId();
    const payment = await this.paymentService.updatePayment(id, body, userId);
    return {
      success: true,
      message: 'Payment updated successfully',
      data: payment,
    };
  };

  delete = async ({
    params: { id },
    getCurrentUserId,
  }: {
    params: { id: number };
    getCurrentUserId: () => Promise<number>;
  }) => {
    const userId = await getCurrentUserId();
    await this.paymentService.deletePayment(id, userId);
    return {
      success: true,
      message: 'Payment deleted successfully',
    };
  };
}

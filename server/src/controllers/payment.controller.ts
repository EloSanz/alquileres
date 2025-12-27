import { IPaymentService } from '../interfaces/services/IPaymentService';
import { CreatePayment, UpdatePayment } from '../../../shared/types/Payment';
import { logInfo, logError, logDebug } from '../utils/logger';

export class PaymentController {
  constructor(private paymentService: IPaymentService) {}

  getAll = async ({ userId }: { userId: number }) => {
    const payments = await this.paymentService.getAllPayments(userId);
    return {
      success: true,
      message: 'Payments retrieved successfully',
      data: payments,
    };
  };

  getById = async ({
    params: { id },
    userId,
  }: {
    params: { id: number };
    userId: number;
  }) => {
    const payment = await this.paymentService.getPaymentById(id, userId);
    return {
      success: true,
      message: 'Payment retrieved successfully',
      data: payment,
    };
  };

  getByTenantId = async ({
    params: { tenantId },
    userId,
  }: {
    params: { tenantId: number };
    userId: number;
  }) => {
    const payments = await this.paymentService.getPaymentsByTenantId(tenantId, userId);
    return {
      success: true,
      message: 'Payments retrieved successfully',
      data: payments,
    };
  };

  create = async ({
    body,
    userId,
  }: {
    body: any;
    userId: number;
  }) => {
    const createPayment = CreatePayment.fromJSON(body);
    const errors = createPayment.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    const payment = await this.paymentService.createPayment(createPayment.toDTO(), userId);
    return {
      success: true,
      message: 'Payment created successfully',
      data: payment,
    };
  };

  update = async ({
    params: { id },
    body,
    userId,
  }: {
    params: { id: number };
    body: any;
    userId: number;
  }) => {
    const updatePayment = UpdatePayment.fromJSON(body);
    const errors = updatePayment.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    const payment = await this.paymentService.updatePayment(id, updatePayment.toDTO(), userId);
    
    return {
      success: true,
      message: 'Payment updated successfully',
      data: payment,
    };
  };

  delete = async ({
    params: { id },
    userId,
    set,
  }: {
    params: { id: number };
    userId: number;
    set: any;
  }) => {
    const deleted = await this.paymentService.deletePayment(id, userId);
    if (!deleted) {
      set.status = 404;
      return {
        success: false,
        message: 'Payment not found',
      };
    }

    return {
      success: true,
      message: 'Payment deleted successfully',
    };
  };
}

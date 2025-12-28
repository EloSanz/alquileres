import { IPaymentService } from '../../interfaces/services/IPaymentService';
import { IPaymentRepository } from '../../interfaces/repositories/IPaymentRepository';
import { PaymentDTO, CreatePaymentDTO, UpdatePaymentDTO } from '../../dtos/payment.dto';
import { PaymentEntity } from '../../entities/Payment.entity';
import { NotFoundError } from '../../exceptions';
import { logInfo } from '../../utils/logger';

export class PaymentService implements IPaymentService {
  constructor(private paymentRepository: IPaymentRepository) {}

  async getAllPayments(_userId: number): Promise<PaymentDTO[]> {
    const entities = await this.paymentRepository.findAll();
    return entities.map(entity => entity.toDTO());
  }

  async getPaymentById(id: number, _userId: number): Promise<PaymentDTO> {
    const entity = await this.paymentRepository.findById(id);
    if (!entity) {
      throw new NotFoundError('Payment', id);
    }
    return entity.toDTO();
  }

  async getPaymentsByTenantId(tenantId: number, _userId: number): Promise<PaymentDTO[]> {
    const entities = await this.paymentRepository.findByTenantId(tenantId);
    return entities.map(entity => entity.toDTO());
  }

  async createPayment(data: CreatePaymentDTO, _userId: number): Promise<PaymentDTO> {
    const entity = PaymentEntity.create(data);
    const savedEntity = await this.paymentRepository.create(entity);
    return savedEntity.toDTO();
  }

  async updatePayment(id: number, data: UpdatePaymentDTO, _userId: number): Promise<PaymentDTO> {
    const existingEntity = await this.paymentRepository.findById(id);
    if (!existingEntity) {
      throw new NotFoundError('Payment', id);
    }

    const updatedEntity = existingEntity.update(data);

    const savedEntity = await this.paymentRepository.update(updatedEntity);
    
    logInfo('[PaymentService] Entity saved to database', {
      paymentId: id,
      savedEntityDTO: JSON.stringify(savedEntity.toDTO(), null, 2),
      savedPaymentDate: savedEntity.paymentDate,
      savedDueDate: savedEntity.dueDate,
      savedUpdatedAt: savedEntity.updatedAt
    });

    const resultDTO = savedEntity.toDTO();
    logInfo('[PaymentService] Returning DTO', {
      paymentId: id,
      resultDTO: JSON.stringify(resultDTO, null, 2),
      resultPaymentDate: resultDTO.paymentDate,
      resultDueDate: resultDTO.dueDate
    });

    return resultDTO;
  }

  async deletePayment(id: number, _userId: number): Promise<boolean> {
    const deleted = await this.paymentRepository.delete(id);
    return deleted;
  }
}

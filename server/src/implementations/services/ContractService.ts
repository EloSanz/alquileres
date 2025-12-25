import { IContractService } from '../../interfaces/services/IContractService';
import { IContractRepository } from '../../interfaces/repositories/IContractRepository';
import { IPaymentRepository } from '../../interfaces/repositories/IPaymentRepository';
import { ContractDTO, CreateContractDTO, UpdateContractDTO } from '../../dtos/contract.dto';
import { ContractEntity } from '../../entities/Contract.entity';
import { PaymentEntity } from '../../entities/Payment.entity';

export class ContractService implements IContractService {
  constructor(
    private contractRepository: IContractRepository,
    private paymentRepository: IPaymentRepository
  ) {}

  async getAllContracts(_userId: number): Promise<ContractDTO[]> {
    const entities = await this.contractRepository.findAll();
    return entities.map(entity => entity.toDTO());
  }

  async getContractById(id: number, _userId: number): Promise<ContractDTO> {
    const entity = await this.contractRepository.findById(id);
    if (!entity) {
      throw new Error('Contract not found');
    }
    return entity.toDTO();
  }

  async getContractProgress(contractId: number, _userId: number): Promise<{
    totalMonths: number;
    paidMonths: number;
    pendingMonths: number;
    overdueMonths: number;
  }> {
    const contract = await this.contractRepository.findById(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const payments = await this.paymentRepository.findByContractId(contractId);
    const now = new Date();

    let paidMonths = 0;
    let pendingMonths = 0;
    let overdueMonths = 0;

    for (const payment of payments) {
      // Si tiene paymentDate y es anterior a hoy, está pagado
      if (payment.paymentDate && payment.paymentDate <= now) {
        paidMonths++;
      } else if (payment.dueDate < now) {
        overdueMonths++;
      } else {
        pendingMonths++;
      }
    }

    return {
      totalMonths: 12,
      paidMonths,
      pendingMonths,
      overdueMonths
    };
  }

  async getActiveContractByTenant(tenantId: number, _userId: number): Promise<ContractDTO | null> {
    const entity = await this.contractRepository.findActiveByTenantId(tenantId);
    return entity ? entity.toDTO() : null;
  }

  async getActiveContractByProperty(propertyId: number, _userId: number): Promise<ContractDTO | null> {
    const entity = await this.contractRepository.findActiveByPropertyId(propertyId);
    return entity ? entity.toDTO() : null;
  }

  async createContract(data: CreateContractDTO, _userId: number): Promise<ContractDTO> {
    // Crear entidad del contrato
    const entity = ContractEntity.create(data);
    entity.validate();

    // Guardar contrato
    const createdContract = await this.contractRepository.create(entity);

    // Generar 12 pagos mensuales automáticamente
    const startDate = new Date(data.startDate);
    for (let month = 1; month <= 12; month++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + month - 1);

      const payment = PaymentEntity.create({
        tenantId: data.tenantId,
        propertyId: data.propertyId,
        contractId: createdContract.id!,
        monthNumber: month,
        amount: data.monthlyRent,
        dueDate: dueDate.toISOString().split('T')[0],
        paymentMethod: 'YAPE', // Default method
      });

      await this.paymentRepository.create(payment);
    }

    return createdContract.toDTO();
  }

  async updateContract(id: number, data: UpdateContractDTO, _userId: number): Promise<ContractDTO> {
    const entity = await this.contractRepository.findById(id);
    if (!entity) {
      throw new Error('Contract not found');
    }

    const updatedEntity = entity.update(data);
    const saved = await this.contractRepository.update(updatedEntity);
    return saved.toDTO();
  }

  async deleteContract(id: number, _userId: number): Promise<boolean> {
    // Verificar si el contrato tiene pagos asociados
    const payments = await this.paymentRepository.findByContractId(id);
    if (payments.length > 0) {
      // No permitir eliminar contratos con pagos (mantener integridad histórica)
      throw new Error('Cannot delete contract with associated payments');
    }

    const deleted = await this.contractRepository.delete(id);
    return deleted;
  }
}


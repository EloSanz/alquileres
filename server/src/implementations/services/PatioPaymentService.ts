import { IPatioPaymentService } from '../../interfaces/services/IPatioPaymentService';
import { IPatioPaymentRepository } from '../../interfaces/repositories/IPatioPaymentRepository';
import { PatioPaymentDTO, CreatePatioPaymentDTO, UpdatePatioPaymentDTO } from '../../dtos/patio-payment.dto';
import { PatioPaymentEntity } from '../../entities/PatioPayment.entity';
import { NotFoundError } from '../../exceptions';

export class PatioPaymentService implements IPatioPaymentService {
    constructor(private patioPaymentRepository: IPatioPaymentRepository) { }

    async getAllPatioPayments(_userId: number): Promise<PatioPaymentDTO[]> {
        const entities = await this.patioPaymentRepository.findAll();
        return entities.map(e => e.toDTO());
    }

    async getPatioPaymentById(id: number, _userId: number): Promise<PatioPaymentDTO> {
        const entity = await this.patioPaymentRepository.findById(id);
        if (!entity) throw new NotFoundError('PatioPayment', id);
        return entity.toDTO();
    }

    async getPatioPaymentsByTenantId(patioTenantId: number, _userId: number): Promise<PatioPaymentDTO[]> {
        const entities = await this.patioPaymentRepository.findByPatioTenantId(patioTenantId);
        return entities.map(e => e.toDTO());
    }

    async createPatioPayment(data: CreatePatioPaymentDTO, _userId: number): Promise<PatioPaymentDTO> {
        const entity = PatioPaymentEntity.create(data);
        const saved = await this.patioPaymentRepository.create(entity);
        return saved.toDTO();
    }

    async updatePatioPayment(id: number, data: UpdatePatioPaymentDTO, _userId: number): Promise<PatioPaymentDTO> {
        const existing = await this.patioPaymentRepository.findById(id);
        if (!existing) throw new NotFoundError('PatioPayment', id);
        const updated = existing.update(data);
        const saved = await this.patioPaymentRepository.update(updated);
        return saved.toDTO();
    }

    async deletePatioPayment(id: number, _userId: number): Promise<boolean> {
        return this.patioPaymentRepository.delete(id);
    }
}

import { IPatioTenantService } from '../../interfaces/services/IPatioTenantService';
import { IPatioTenantRepository } from '../../interfaces/repositories/IPatioTenantRepository';
import { PatioTenantDTO, CreatePatioTenantDTO, UpdatePatioTenantDTO } from '../../dtos/patio-tenant.dto';
import { PatioTenantEntity } from '../../entities/PatioTenant.entity';
import { NotFoundError } from '../../exceptions';

export class PatioTenantService implements IPatioTenantService {
    constructor(private patioTenantRepository: IPatioTenantRepository) { }

    async getAllPatioTenants(_userId: number): Promise<PatioTenantDTO[]> {
        const entities = await this.patioTenantRepository.findAll();
        return entities.map(e => e.toDTO());
    }

    async getPatioTenantById(id: number, _userId: number): Promise<PatioTenantDTO> {
        const entity = await this.patioTenantRepository.findById(id);
        if (!entity) throw new NotFoundError('PatioTenant', id);
        return entity.toDTO();
    }

    async createPatioTenant(data: CreatePatioTenantDTO, _userId: number): Promise<PatioTenantDTO> {
        const entity = PatioTenantEntity.create(data);
        const saved = await this.patioTenantRepository.create(entity);
        return saved.toDTO();
    }

    async updatePatioTenant(id: number, data: UpdatePatioTenantDTO, _userId: number): Promise<PatioTenantDTO> {
        const existing = await this.patioTenantRepository.findById(id);
        if (!existing) throw new NotFoundError('PatioTenant', id);
        const updated = existing.update(data);
        const saved = await this.patioTenantRepository.update(updated);
        return saved.toDTO();
    }

    async deletePatioTenant(id: number, _userId: number): Promise<boolean> {
        return this.patioTenantRepository.delete(id);
    }
}

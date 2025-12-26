import { IGuaranteeService } from '../../interfaces/services/IGuaranteeService';
import { IGuaranteeRepository } from '../../interfaces/repositories/IGuaranteeRepository';
import { GuaranteeDTO, CreateGuaranteeDTO, UpdateGuaranteeDTO } from '../../dtos/guarantee.dto';
import { GuaranteeEntity } from '../../entities/Guarantee.entity';

export class GuaranteeService implements IGuaranteeService {
  constructor(private guaranteeRepository: IGuaranteeRepository) {}

  async getAllGuarantees(_userId: number): Promise<GuaranteeDTO[]> {
    const entities = await this.guaranteeRepository.findAll();
    return entities.map(entity => entity.toDTO());
  }

  async getGuaranteeById(id: number, _userId: number): Promise<GuaranteeDTO> {
    const entity = await this.guaranteeRepository.findById(id);
    if (!entity) {
      throw new Error('Guarantee not found');
    }
    return entity.toDTO();
  }

  async createGuarantee(data: CreateGuaranteeDTO, _userId: number): Promise<GuaranteeDTO> {
    const entity = GuaranteeEntity.create(data);
    const savedEntity = await this.guaranteeRepository.create(entity);
    return savedEntity.toDTO();
  }

  async updateGuarantee(id: number, data: UpdateGuaranteeDTO, _userId: number): Promise<GuaranteeDTO> {
    const existingEntity = await this.guaranteeRepository.findById(id);
    if (!existingEntity) {
      throw new Error('Guarantee not found');
    }

    const updatedEntity = existingEntity.update(data);
    const savedEntity = await this.guaranteeRepository.update(updatedEntity);
    return savedEntity.toDTO();
  }

  async deleteGuarantee(id: number, _userId: number): Promise<boolean> {
    const deleted = await this.guaranteeRepository.delete(id);
    return deleted;
  }
}

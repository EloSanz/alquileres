import { ITaxService } from '../../interfaces/services/ITaxService';
import { ITaxRepository } from '../../interfaces/repositories/ITaxRepository';
import { TaxDTO, CreateTaxDTO, UpdateTaxDTO } from '../../dtos/tax.dto';
import { TaxEntity } from '../../entities/Tax.entity';

export class TaxService implements ITaxService {
  constructor(private taxRepository: ITaxRepository) {}

  async getAllTaxes(_userId: number): Promise<TaxDTO[]> {
    const entities = await this.taxRepository.findAll();
    return entities.map(entity => entity.toDTO());
  }

  async getTaxById(id: number, _userId: number): Promise<TaxDTO> {
    const entity = await this.taxRepository.findById(id);
    if (!entity) {
      throw new Error('Tax not found');
    }
    return entity.toDTO();
  }

  async createTax(data: CreateTaxDTO, _userId: number): Promise<TaxDTO> {
    const entity = TaxEntity.create(data);
    const savedEntity = await this.taxRepository.create(entity);
    return savedEntity.toDTO();
  }

  async updateTax(id: number, data: UpdateTaxDTO, _userId: number): Promise<TaxDTO> {
    const existingEntity = await this.taxRepository.findById(id);
    if (!existingEntity) {
      throw new Error('Tax not found');
    }

    const updatedEntity = existingEntity.update(data);
    const savedEntity = await this.taxRepository.update(updatedEntity);
    return savedEntity.toDTO();
  }

  async deleteTax(id: number, _userId: number): Promise<boolean> {
    const deleted = await this.taxRepository.delete(id);
    return deleted;
  }
}

import { IPropertyService } from '../../interfaces/services/IPropertyService';
import { IPropertyRepository } from '../../interfaces/repositories/IPropertyRepository';
import { PropertyDTO, CreatePropertyDTO, UpdatePropertyDTO } from '../../dtos/property.dto';
import { PropertyEntity } from '../../entities/Property.entity';

export class PropertyService implements IPropertyService {
  constructor(private propertyRepository: IPropertyRepository) {}

  async getAllProperties(_userId: number): Promise<PropertyDTO[]> {
    const entities = await this.propertyRepository.findAll();
    return entities.map(entity => entity.toDTO());
  }

  async getPropertyById(id: number, _userId: number): Promise<PropertyDTO> {
    const entity = await this.propertyRepository.findById(id);
    if (!entity) {
      throw new Error('Property not found');
    }
    return entity.toDTO();
  }

  async createProperty(data: CreatePropertyDTO, _userId: number): Promise<PropertyDTO> {
    const entity = PropertyEntity.create(data);
    const savedEntity = await this.propertyRepository.create(entity);
    return savedEntity.toDTO();
  }

  async updateProperty(id: number, data: UpdatePropertyDTO, _userId: number): Promise<PropertyDTO> {
    const existingEntity = await this.propertyRepository.findById(id);
    if (!existingEntity) {
      throw new Error('Property not found');
    }

    const updatedEntity = existingEntity.update(data);
    const savedEntity = await this.propertyRepository.update(updatedEntity);
    return savedEntity.toDTO();
  }

  async deleteProperty(id: number, _userId: number): Promise<void> {
    const entity = await this.propertyRepository.findById(id);
    if (!entity) {
      throw new Error('Property not found');
    }
    await this.propertyRepository.delete(id);
  }
}

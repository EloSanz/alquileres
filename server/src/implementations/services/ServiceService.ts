import { IServiceService } from '../../interfaces/services/IServiceService';
import { IServiceRepository } from '../../interfaces/repositories/IServiceRepository';
import { ServiceDTO, CreateServiceDTO, UpdateServiceDTO } from '../../dtos/service.dto';
import { ServiceEntity } from '../../entities/Service.entity';

export class ServiceService implements IServiceService {
  constructor(private serviceRepository: IServiceRepository) {}

  async getAllServices(_userId: number): Promise<ServiceDTO[]> {
    const entities = await this.serviceRepository.findAll();
    return entities.map(entity => entity.toDTO());
  }

  async getServiceById(id: number, _userId: number): Promise<ServiceDTO> {
    const entity = await this.serviceRepository.findById(id);
    if (!entity) {
      throw new Error('Service not found');
    }
    return entity.toDTO();
  }

  async createService(data: CreateServiceDTO, _userId: number): Promise<ServiceDTO> {
    const entity = ServiceEntity.create(data);
    const savedEntity = await this.serviceRepository.create(entity);
    return savedEntity.toDTO();
  }

  async updateService(id: number, data: UpdateServiceDTO, _userId: number): Promise<ServiceDTO> {
    const existingEntity = await this.serviceRepository.findById(id);
    if (!existingEntity) {
      throw new Error('Service not found');
    }

    const updatedEntity = existingEntity.update(data);
    const savedEntity = await this.serviceRepository.update(updatedEntity);
    return savedEntity.toDTO();
  }

  async deleteService(id: number, _userId: number): Promise<boolean> {
    const deleted = await this.serviceRepository.delete(id);
    return deleted;
  }
}


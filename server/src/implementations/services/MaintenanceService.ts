import { IMaintenanceService } from '../../interfaces/services/IMaintenanceService';
import { IMaintenanceRepository } from '../../interfaces/repositories/IMaintenanceRepository';
import { MaintenanceDTO, CreateMaintenanceDTO, UpdateMaintenanceDTO } from '../../dtos/maintenance.dto';
import { MaintenanceEntity } from '../../entities/Maintenance.entity';

export class MaintenanceService implements IMaintenanceService {
  constructor(private maintenanceRepository: IMaintenanceRepository) {}

  async getAllMaintenances(_userId: number): Promise<MaintenanceDTO[]> {
    const entities = await this.maintenanceRepository.findAll();
    return entities.map(entity => entity.toDTO());
  }

  async getMaintenanceById(id: number, _userId: number): Promise<MaintenanceDTO> {
    const entity = await this.maintenanceRepository.findById(id);
    if (!entity) {
      throw new Error('Maintenance not found');
    }
    return entity.toDTO();
  }

  async createMaintenance(data: CreateMaintenanceDTO, _userId: number): Promise<MaintenanceDTO> {
    const entity = MaintenanceEntity.create(data);
    const savedEntity = await this.maintenanceRepository.create(entity);
    return savedEntity.toDTO();
  }

  async updateMaintenance(id: number, data: UpdateMaintenanceDTO, _userId: number): Promise<MaintenanceDTO> {
    const existingEntity = await this.maintenanceRepository.findById(id);
    if (!existingEntity) {
      throw new Error('Maintenance not found');
    }

    const updatedEntity = existingEntity.update(data);
    const savedEntity = await this.maintenanceRepository.update(updatedEntity);
    return savedEntity.toDTO();
  }

  async deleteMaintenance(id: number, _userId: number): Promise<boolean> {
    const deleted = await this.maintenanceRepository.delete(id);
    return deleted;
  }
}

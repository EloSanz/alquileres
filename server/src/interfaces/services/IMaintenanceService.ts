import { MaintenanceDTO, CreateMaintenanceDTO, UpdateMaintenanceDTO } from '../../dtos/maintenance.dto';

export interface IMaintenanceService {
  getAllMaintenances(userId: number): Promise<MaintenanceDTO[]>;
  getMaintenanceById(id: number, userId: number): Promise<MaintenanceDTO>;
  createMaintenance(data: CreateMaintenanceDTO, userId: number): Promise<MaintenanceDTO>;
  updateMaintenance(id: number, data: UpdateMaintenanceDTO, userId: number): Promise<MaintenanceDTO>;
  deleteMaintenance(id: number, userId: number): Promise<boolean>;
}

import { IMaintenanceService } from '../interfaces/services/IMaintenanceService';
import { CreateMaintenanceDTO, UpdateMaintenanceDTO } from '../dtos/maintenance.dto';

export class MaintenanceController {
  constructor(private maintenanceService: IMaintenanceService) {}

  getAll = async ({ userId }: { userId: number }) => {
    const maintenances = await this.maintenanceService.getAllMaintenances(userId);
    return {
      success: true,
      message: 'Maintenances retrieved successfully',
      data: maintenances,
    };
  };

  getById = async ({
    params: { id },
    userId,
  }: {
    params: { id: number };
    userId: number;
  }) => {
    const maintenance = await this.maintenanceService.getMaintenanceById(id, userId);
    return {
      success: true,
      message: 'Maintenance retrieved successfully',
      data: maintenance,
    };
  };

  create = async ({
    body,
    userId,
  }: {
    body: CreateMaintenanceDTO;
    userId: number;
  }) => {
    const maintenance = await this.maintenanceService.createMaintenance(body, userId);
    return {
      success: true,
      message: 'Maintenance created successfully',
      data: maintenance,
    };
  };

  update = async ({
    params: { id },
    body,
    userId,
  }: {
    params: { id: number };
    body: UpdateMaintenanceDTO;
    userId: number;
  }) => {
    const maintenance = await this.maintenanceService.updateMaintenance(id, body, userId);
    return {
      success: true,
      message: 'Maintenance updated successfully',
      data: maintenance,
    };
  };

  delete = async ({
    params: { id },
    userId,
    set,
  }: {
    params: { id: number };
    userId: number;
    set: any;
  }) => {
    const deleted = await this.maintenanceService.deleteMaintenance(id, userId);
    if (!deleted) {
      set.status = 404;
      return {
        success: false,
        message: 'Maintenance not found',
      };
    }

    return {
      success: true,
      message: 'Maintenance deleted successfully',
    };
  };
}

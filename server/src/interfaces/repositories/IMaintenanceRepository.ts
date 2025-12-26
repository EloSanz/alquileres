import { MaintenanceEntity } from '../../entities/Maintenance.entity';

export interface IMaintenanceRepository {
  findAll(): Promise<MaintenanceEntity[]>;
  findById(id: number): Promise<MaintenanceEntity | null>;
  findByPropertyId(propertyId: number): Promise<MaintenanceEntity[]>;
  findByContractId(contractId: number): Promise<MaintenanceEntity[]>;
  create(entity: MaintenanceEntity): Promise<MaintenanceEntity>;
  update(entity: MaintenanceEntity): Promise<MaintenanceEntity>;
  delete(id: number): Promise<boolean>;
}

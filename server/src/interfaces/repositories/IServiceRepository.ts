import { ServiceEntity } from '../../entities/Service.entity';

export interface IServiceRepository {
  findAll(): Promise<ServiceEntity[]>;
  findById(id: number): Promise<ServiceEntity | null>;
  findByPropertyId(propertyId: number): Promise<ServiceEntity[]>;
  findByContractId(contractId: number): Promise<ServiceEntity[]>;
  create(entity: ServiceEntity): Promise<ServiceEntity>;
  update(entity: ServiceEntity): Promise<ServiceEntity>;
  delete(id: number): Promise<boolean>;
}


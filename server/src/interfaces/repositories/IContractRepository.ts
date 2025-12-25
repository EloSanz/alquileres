import { ContractEntity } from '../../entities/Contract.entity';

export interface IContractRepository {
  findAll(): Promise<ContractEntity[]>;
  findById(id: number): Promise<ContractEntity | null>;
  findByTenantId(tenantId: number): Promise<ContractEntity[]>;
  findByPropertyId(propertyId: number): Promise<ContractEntity[]>;
  findActiveByTenantId(tenantId: number): Promise<ContractEntity | null>;
  findActiveByPropertyId(propertyId: number): Promise<ContractEntity | null>;
  create(entity: ContractEntity): Promise<ContractEntity>;
  update(entity: ContractEntity): Promise<ContractEntity>;
  delete(id: number): Promise<boolean>;
}


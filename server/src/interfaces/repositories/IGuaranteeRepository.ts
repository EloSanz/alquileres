import { GuaranteeEntity } from '../../entities/Guarantee.entity';

export interface IGuaranteeRepository {
  findAll(): Promise<GuaranteeEntity[]>;
  findById(id: number): Promise<GuaranteeEntity | null>;
  findByPropertyId(propertyId: number): Promise<GuaranteeEntity[]>;
  findByContractId(contractId: number): Promise<GuaranteeEntity[]>;
  findByTenantId(tenantId: number): Promise<GuaranteeEntity[]>;
  create(entity: GuaranteeEntity): Promise<GuaranteeEntity>;
  update(entity: GuaranteeEntity): Promise<GuaranteeEntity>;
  delete(id: number): Promise<boolean>;
}

import { TaxEntity } from '../../entities/Tax.entity';

export interface ITaxRepository {
  findAll(): Promise<TaxEntity[]>;
  findById(id: number): Promise<TaxEntity | null>;
  findByPropertyId(propertyId: number): Promise<TaxEntity[]>;
  findByContractId(contractId: number): Promise<TaxEntity[]>;
  create(entity: TaxEntity): Promise<TaxEntity>;
  update(entity: TaxEntity): Promise<TaxEntity>;
  delete(id: number): Promise<boolean>;
}

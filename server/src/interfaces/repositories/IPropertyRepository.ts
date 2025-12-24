import { PropertyEntity } from '../../entities/Property.entity';

export interface IPropertyRepository {
  findAll(): Promise<PropertyEntity[]>;
  findById(id: number): Promise<PropertyEntity | null>;
  findByTenantId(tenantId: number): Promise<PropertyEntity[]>;
  create(entity: PropertyEntity): Promise<PropertyEntity>;
  update(entity: PropertyEntity): Promise<PropertyEntity>;
  delete(id: number): Promise<boolean>;
}

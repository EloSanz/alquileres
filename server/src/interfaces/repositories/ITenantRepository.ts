import { TenantEntity } from '../../entities/Tenant.entity';

export interface ITenantRepository {
  findAll(): Promise<TenantEntity[]>;
  findAllWithRelations(): Promise<TenantEntity[]>;
  findById(id: number): Promise<TenantEntity | null>;
  findByDocumentId(documentId: string): Promise<TenantEntity | null>;
  create(tenant: TenantEntity): Promise<TenantEntity>;
  update(id: number, tenant: TenantEntity): Promise<TenantEntity>;
  delete(id: number): Promise<boolean>;
}

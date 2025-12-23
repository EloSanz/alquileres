import { TenantDTO, CreateTenantDTO, UpdateTenantDTO } from '../../entities/Tenant.entity';

export interface ITenantService {
  getAllTenants(): Promise<TenantDTO[]>;
  getTenantById(id: number): Promise<TenantDTO>;
  getTenantByEmail(email: string): Promise<TenantDTO>;
  getTenantByDocumentId(documentId: string): Promise<TenantDTO>;
  createTenant(data: CreateTenantDTO): Promise<TenantDTO>;
  updateTenant(id: number, data: UpdateTenantDTO): Promise<TenantDTO>;
  deleteTenant(id: number): Promise<void>;
}

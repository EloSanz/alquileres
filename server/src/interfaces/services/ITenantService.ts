import { TenantDTO, CreateTenantDTO, UpdateTenantDTO } from '../../dtos/tenant.dto';

export interface ITenantService {
  getAllTenants(userId: number): Promise<TenantDTO[]>;
  getTenantById(id: number, userId: number): Promise<TenantDTO>;
  getTenantByEmail(email: string, userId: number): Promise<TenantDTO>;
  getTenantByDocumentId(documentId: string, userId: number): Promise<TenantDTO>;
  createTenant(data: CreateTenantDTO, userId: number): Promise<TenantDTO>;
  updateTenant(id: number, data: UpdateTenantDTO, userId: number): Promise<TenantDTO>;
  deleteTenant(id: number, userId: number): Promise<void>;
}

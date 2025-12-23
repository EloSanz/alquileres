import { ITenantService } from '../interfaces/services/ITenantService';
import { CreateTenantDTO, UpdateTenantDTO } from '../dtos/tenant.dto';

export class TenantController {
  constructor(private tenantService: ITenantService) {}

  getAll = async ({ getCurrentUserId }: { getCurrentUserId: () => Promise<number> }) => {
    const userId = await getCurrentUserId();
    const tenants = await this.tenantService.getAllTenants(userId);
    return {
      success: true,
      message: 'Tenants retrieved successfully',
      data: tenants,
    };
  };

  getById = async ({
    params: { id },
    getCurrentUserId,
  }: {
    params: { id: number };
    getCurrentUserId: () => Promise<number>;
  }) => {
    const userId = await getCurrentUserId();
    const tenant = await this.tenantService.getTenantById(id, userId);
    return {
      success: true,
      message: 'Tenant retrieved successfully',
      data: tenant,
    };
  };

  getByEmail = async ({
    params: { email },
    getCurrentUserId,
  }: {
    params: { email: string };
    getCurrentUserId: () => Promise<number>;
  }) => {
    const userId = await getCurrentUserId();
    const tenant = await this.tenantService.getTenantByEmail(email, userId);
    return {
      success: true,
      message: 'Tenant retrieved successfully',
      data: tenant,
    };
  };

  getByDocumentId = async ({
    params: { documentId },
    getCurrentUserId,
  }: {
    params: { documentId: string };
    getCurrentUserId: () => Promise<number>;
  }) => {
    const userId = await getCurrentUserId();
    const tenant = await this.tenantService.getTenantByDocumentId(documentId, userId);
    return {
      success: true,
      message: 'Tenant retrieved successfully',
      data: tenant,
    };
  };

  create = async ({
    body,
    getCurrentUserId,
  }: {
    body: CreateTenantDTO;
    getCurrentUserId: () => Promise<number>;
  }) => {
    const userId = await getCurrentUserId();
    const tenant = await this.tenantService.createTenant(body, userId);
    return {
      success: true,
      message: 'Tenant created successfully',
      data: tenant,
    };
  };

  update = async ({
    params: { id },
    body,
    getCurrentUserId,
  }: {
    params: { id: number };
    body: UpdateTenantDTO;
    getCurrentUserId: () => Promise<number>;
  }) => {
    const userId = await getCurrentUserId();
    const tenant = await this.tenantService.updateTenant(id, body, userId);
    return {
      success: true,
      message: 'Tenant updated successfully',
      data: tenant,
    };
  };

  delete = async ({
    params: { id },
    getCurrentUserId,
  }: {
    params: { id: number };
    getCurrentUserId: () => Promise<number>;
  }) => {
    const userId = await getCurrentUserId();
    await this.tenantService.deleteTenant(id, userId);
    return {
      success: true,
      message: 'Tenant deleted successfully',
    };
  };
}

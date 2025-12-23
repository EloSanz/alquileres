import { ITenantService } from '../interfaces/services/ITenantService';
import { CreateTenantDTO, UpdateTenantDTO } from '../entities/Tenant.entity';

export class TenantController {
  constructor(private tenantService: ITenantService) {}

  getAll = async () => ({
    success: true,
    message: 'Tenants retrieved successfully',
    data: await this.tenantService.getAllTenants(),
    timestamp: new Date().toISOString()
  });

  getById = async ({ params }: { params: { id: number } }) => ({
    success: true,
    message: 'Tenant retrieved successfully',
    data: await this.tenantService.getTenantById(params.id),
    timestamp: new Date().toISOString()
  });

  getByEmail = async ({ params }: { params: { email: string } }) => ({
    success: true,
    message: 'Tenant retrieved successfully',
    data: await this.tenantService.getTenantByEmail(params.email),
    timestamp: new Date().toISOString()
  });

  getByDocumentId = async ({ params }: { params: { documentId: string } }) => ({
    success: true,
    message: 'Tenant retrieved successfully',
    data: await this.tenantService.getTenantByDocumentId(params.documentId),
    timestamp: new Date().toISOString()
  });

  create = async ({ body }: { body: CreateTenantDTO }) => ({
    success: true,
    message: 'Tenant created successfully',
    data: await this.tenantService.createTenant(body),
    timestamp: new Date().toISOString()
  });

  update = async ({
    params,
    body
  }: {
    params: { id: number },
    body: UpdateTenantDTO
  }) => ({
    success: true,
    message: 'Tenant updated successfully',
    data: await this.tenantService.updateTenant(params.id, body),
    timestamp: new Date().toISOString()
  });

  delete = async ({ params }: { params: { id: number } }) => {
    await this.tenantService.deleteTenant(params.id);
    return {
      success: true,
      message: 'Tenant deleted successfully',
      data: null,
      timestamp: new Date().toISOString()
    };
  };
}

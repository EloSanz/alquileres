import { ITenantService } from '../interfaces/services/ITenantService';
import { CreateTenantSchema, UpdateTenantSchema } from '../../../shared/types/Tenant';
import { ValidationError } from '../exceptions';

export class TenantController {
  constructor(private tenantService: ITenantService) { }

  getAll = async ({ userId }: { userId: number }) => {
    const tenants = await this.tenantService.getAllTenants(userId);
    return {
      success: true,
      message: 'Tenants retrieved successfully',
      data: tenants,
    };
  };

  getById = async ({
    params: { id },
    userId,
  }: {
    params: { id: number };
    userId: number;
  }) => {
    const tenant = await this.tenantService.getTenantById(id, userId);
    return {
      success: true,
      message: 'Tenant retrieved successfully',
      data: tenant,
    };
  };


  getByDocumentId = async ({
    params: { documentId },
    userId,
  }: {
    params: { documentId: string };
    userId: number;
  }) => {
    const tenant = await this.tenantService.getTenantByDocumentId(documentId, userId);
    return {
      success: true,
      message: 'Tenant retrieved successfully',
      data: tenant,
    };
  };

  create = async ({
    body,
    userId,
  }: {
    body: any;
    userId: number;
  }) => {
    const result = CreateTenantSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.issues.map((e: any) => e.message);
      throw new ValidationError('Validation failed', errors);
    }
    const tenant = await this.tenantService.createTenant(result.data, userId);
    return {
      success: true,
      message: 'Tenant created successfully',
      data: tenant,
    };
  };

  update = async ({
    params: { id },
    body,
    userId,
  }: {
    params: { id: number };
    body: any;
    userId: number;
  }) => {
    const result = UpdateTenantSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.issues.map((e: any) => e.message);
      throw new ValidationError('Validation failed', errors);
    }
    const tenant = await this.tenantService.updateTenant(id, result.data, userId);
    return {
      success: true,
      message: 'Tenant updated successfully',
      data: tenant,
    };
  };

  delete = async ({
    params: { id },
    userId,
    set,
  }: {
    params: { id: number };
    userId: number;
    set: any;
  }) => {
    try {
      const deleted = await this.tenantService.deleteTenant(id, userId);
      if (!deleted) {
        set.status = 404;
        return {
          success: false,
          message: 'Tenant not found',
        };
      }

      return {
        success: true,
        message: 'Tenant deleted successfully',
      };
    } catch (error: any) {
      if (error.code === 'TENANT_HAS_PROPERTIES') {
        set.status = 400;
        return {
          success: false,
          message: error.message,
          code: error.code,
          properties: error.properties,
        };
      }
      throw error;
    }
  };
}

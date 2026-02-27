import { IPatioTenantService } from '../interfaces/services/IPatioTenantService';

export class PatioTenantController {
    constructor(private patioTenantService: IPatioTenantService) { }

    getAll = async ({ userId }: { userId: number }) => {
        const tenants = await this.patioTenantService.getAllPatioTenants(userId);
        return { success: true, message: 'Patio tenants retrieved successfully', data: tenants };
    };

    getById = async ({ params: { id }, userId }: { params: { id: number }; userId: number }) => {
        const tenant = await this.patioTenantService.getPatioTenantById(id, userId);
        return { success: true, message: 'Patio tenant retrieved successfully', data: tenant };
    };

    create = async ({ body, userId }: { body: any; userId: number }) => {
        const tenant = await this.patioTenantService.createPatioTenant(body, userId);
        return { success: true, message: 'Patio tenant created successfully', data: tenant };
    };

    update = async ({ params: { id }, body, userId }: { params: { id: number }; body: any; userId: number }) => {
        const tenant = await this.patioTenantService.updatePatioTenant(id, body, userId);
        return { success: true, message: 'Patio tenant updated successfully', data: tenant };
    };

    delete = async ({ params: { id }, userId, set }: { params: { id: number }; userId: number; set: any }) => {
        const deleted = await this.patioTenantService.deletePatioTenant(id, userId);
        if (!deleted) {
            set.status = 404;
            return { success: false, message: 'Patio tenant not found' };
        }
        return { success: true, message: 'Patio tenant deleted successfully' };
    };
}

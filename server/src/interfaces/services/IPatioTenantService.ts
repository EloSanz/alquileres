import { PatioTenantDTO, CreatePatioTenantDTO, UpdatePatioTenantDTO } from '../../dtos/patio-tenant.dto';

export interface IPatioTenantService {
    getAllPatioTenants(userId: number): Promise<PatioTenantDTO[]>;
    getPatioTenantById(id: number, userId: number): Promise<PatioTenantDTO>;
    createPatioTenant(data: CreatePatioTenantDTO, userId: number): Promise<PatioTenantDTO>;
    updatePatioTenant(id: number, data: UpdatePatioTenantDTO, userId: number): Promise<PatioTenantDTO>;
    deletePatioTenant(id: number, userId: number): Promise<boolean>;
}

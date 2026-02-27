import { PatioTenantEntity } from '../../entities/PatioTenant.entity';

export interface IPatioTenantRepository {
    findAll(): Promise<PatioTenantEntity[]>;
    findById(id: number): Promise<PatioTenantEntity | null>;
    create(entity: PatioTenantEntity): Promise<PatioTenantEntity>;
    update(entity: PatioTenantEntity): Promise<PatioTenantEntity>;
    delete(id: number): Promise<boolean>;
}

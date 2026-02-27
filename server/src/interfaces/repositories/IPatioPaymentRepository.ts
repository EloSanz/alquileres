import { PatioPaymentEntity } from '../../entities/PatioPayment.entity';

export interface IPatioPaymentRepository {
    findAll(): Promise<PatioPaymentEntity[]>;
    findById(id: number): Promise<PatioPaymentEntity | null>;
    findByPatioTenantId(patioTenantId: number): Promise<PatioPaymentEntity[]>;
    create(entity: PatioPaymentEntity): Promise<PatioPaymentEntity>;
    update(entity: PatioPaymentEntity): Promise<PatioPaymentEntity>;
    delete(id: number): Promise<boolean>;
}

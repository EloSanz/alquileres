import { PatioPaymentDTO, CreatePatioPaymentDTO, UpdatePatioPaymentDTO } from '../../dtos/patio-payment.dto';

export interface IPatioPaymentService {
    getAllPatioPayments(userId: number): Promise<PatioPaymentDTO[]>;
    getPatioPaymentById(id: number, userId: number): Promise<PatioPaymentDTO>;
    getPatioPaymentsByTenantId(patioTenantId: number, userId: number): Promise<PatioPaymentDTO[]>;
    createPatioPayment(data: CreatePatioPaymentDTO, userId: number): Promise<PatioPaymentDTO>;
    updatePatioPayment(id: number, data: UpdatePatioPaymentDTO, userId: number): Promise<PatioPaymentDTO>;
    deletePatioPayment(id: number, userId: number): Promise<boolean>;
}

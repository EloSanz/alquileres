import { IPatioPaymentService } from '../interfaces/services/IPatioPaymentService';

export class PatioPaymentController {
    constructor(private patioPaymentService: IPatioPaymentService) { }

    getAll = async ({ userId }: { userId: number }) => {
        const payments = await this.patioPaymentService.getAllPatioPayments(userId);
        return { success: true, message: 'Patio payments retrieved successfully', data: payments };
    };

    getById = async ({ params: { id }, userId }: { params: { id: number }; userId: number }) => {
        const payment = await this.patioPaymentService.getPatioPaymentById(id, userId);
        return { success: true, message: 'Patio payment retrieved successfully', data: payment };
    };

    getByTenantId = async ({ params: { patioTenantId }, userId }: { params: { patioTenantId: number }; userId: number }) => {
        const payments = await this.patioPaymentService.getPatioPaymentsByTenantId(patioTenantId, userId);
        return { success: true, message: 'Patio payments retrieved successfully', data: payments };
    };

    create = async ({ body, userId }: { body: any; userId: number }) => {
        const payment = await this.patioPaymentService.createPatioPayment(body, userId);
        return { success: true, message: 'Patio payment created successfully', data: payment };
    };

    update = async ({ params: { id }, body, userId }: { params: { id: number }; body: any; userId: number }) => {
        const payment = await this.patioPaymentService.updatePatioPayment(id, body, userId);
        return { success: true, message: 'Patio payment updated successfully', data: payment };
    };

    delete = async ({ params: { id }, userId, set }: { params: { id: number }; userId: number; set: any }) => {
        const deleted = await this.patioPaymentService.deletePatioPayment(id, userId);
        if (!deleted) {
            set.status = 404;
            return { success: false, message: 'Patio payment not found' };
        }
        return { success: true, message: 'Patio payment deleted successfully' };
    };
}

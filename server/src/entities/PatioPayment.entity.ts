import { PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import { PatioPaymentDTO } from '../dtos/patio-payment.dto';

export class PatioPaymentEntity {
    constructor(
        public id: number | null,
        public patioTenantId: number,
        public monto: Prisma.Decimal,
        public fechaPago: Date,
        public fechaVencimiento: Date,
        public metodoPago: PaymentMethod,
        public estado: PaymentStatus,
        public notas: string | null,
        public pentamontSettled: boolean,
        public receiptImageUrl: string | null,
        public receiptImagePublicId: string | null,
        public deletedAt: Date | null,
        public createdAt: Date,
        public updatedAt: Date
    ) { }

    static create(data: {
        patioTenantId: number;
        monto: number;
        fechaPago?: string;
        fechaVencimiento: string;
        metodoPago?: string;
        estado?: string;
        notas?: string;
        pentamontSettled?: boolean;
        receiptImageUrl?: string;
        receiptImagePublicId?: string;
    }): PatioPaymentEntity {
        return new PatioPaymentEntity(
            null,
            data.patioTenantId,
            new Prisma.Decimal(data.monto),
            data.fechaPago ? new Date(data.fechaPago) : new Date(),
            new Date(data.fechaVencimiento),
            (data.metodoPago as PaymentMethod) || PaymentMethod.YAPE,
            (data.estado as PaymentStatus) || PaymentStatus.FUTURO,
            data.notas || null,
            data.pentamontSettled ?? false,
            data.receiptImageUrl || null,
            data.receiptImagePublicId || null,
            null,
            new Date(),
            new Date()
        );
    }

    update(data: {
        patioTenantId?: number;
        monto?: number;
        fechaPago?: string;
        fechaVencimiento?: string;
        metodoPago?: string;
        estado?: string;
        notas?: string;
        pentamontSettled?: boolean;
        receiptImageUrl?: string;
        receiptImagePublicId?: string;
    }): PatioPaymentEntity {
        if (data.patioTenantId !== undefined) this.patioTenantId = data.patioTenantId;
        if (data.monto !== undefined) this.monto = new Prisma.Decimal(data.monto);
        if (data.fechaPago !== undefined) this.fechaPago = new Date(data.fechaPago);
        if (data.fechaVencimiento !== undefined) this.fechaVencimiento = new Date(data.fechaVencimiento);
        if (data.metodoPago !== undefined) this.metodoPago = data.metodoPago as PaymentMethod;
        if (data.estado !== undefined) this.estado = data.estado as PaymentStatus;
        if (data.notas !== undefined) this.notas = data.notas || null;
        if (data.pentamontSettled !== undefined) this.pentamontSettled = data.pentamontSettled;
        if (data.receiptImageUrl !== undefined) this.receiptImageUrl = data.receiptImageUrl || null;
        if (data.receiptImagePublicId !== undefined) this.receiptImagePublicId = data.receiptImagePublicId || null;
        this.updatedAt = new Date();
        return this;
    }

    static fromPrisma(prismaData: any): PatioPaymentEntity {
        return new PatioPaymentEntity(
            prismaData.id,
            prismaData.patioTenantId,
            prismaData.monto,
            prismaData.fechaPago,
            prismaData.fechaVencimiento,
            prismaData.metodoPago,
            prismaData.estado || PaymentStatus.FUTURO,
            prismaData.notas,
            prismaData.pentamontSettled ?? false,
            prismaData.receiptImageUrl,
            prismaData.receiptImagePublicId,
            prismaData.deletedAt,
            prismaData.createdAt,
            prismaData.updatedAt
        );
    }

    toPrisma() {
        return {
            id: this.id || undefined,
            patioTenantId: this.patioTenantId,
            monto: this.monto,
            fechaPago: this.fechaPago,
            fechaVencimiento: this.fechaVencimiento,
            metodoPago: this.metodoPago,
            estado: this.estado,
            notas: this.notas,
            pentamontSettled: this.pentamontSettled,
            receiptImageUrl: this.receiptImageUrl,
            receiptImagePublicId: this.receiptImagePublicId,
            deletedAt: this.deletedAt,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    toDTO(): PatioPaymentDTO {
        const formatDate = (d: Date): string => {
            const y = d.getUTCFullYear();
            const m = String(d.getUTCMonth() + 1).padStart(2, '0');
            const day = String(d.getUTCDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };

        return {
            id: this.id!,
            patioTenantId: this.patioTenantId,
            monto: Number(this.monto),
            fechaPago: formatDate(this.fechaPago),
            fechaVencimiento: formatDate(this.fechaVencimiento),
            metodoPago: this.metodoPago.toString(),
            estado: this.estado.toString(),
            notas: this.notas,
            pentamontSettled: this.pentamontSettled,
            receiptImageUrl: this.receiptImageUrl,
            receiptImagePublicId: this.receiptImagePublicId,
            deletedAt: this.deletedAt ? this.deletedAt.toISOString() : null,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }
}

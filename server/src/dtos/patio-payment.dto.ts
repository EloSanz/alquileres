export interface PatioPaymentDTO {
    id: number;
    patioTenantId: number;
    monto: number;
    fechaPago: string;
    fechaVencimiento: string;
    metodoPago: string;
    estado: string;
    notas: string | null;
    pentamontSettled: boolean;
    receiptImageUrl: string | null;
    receiptImagePublicId: string | null;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePatioPaymentDTO {
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
}

export interface UpdatePatioPaymentDTO {
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
}

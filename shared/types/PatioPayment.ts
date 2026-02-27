export interface PatioPayment {
    id: number;
    patioTenantId: number;
    monto: number;
    fechaPago: string;
    fechaVencimiento: string;
    metodoPago: 'YAPE' | 'DEPOSITO' | 'TRANSFERENCIA_VIRTUAL';
    estado: 'PAGADO' | 'VENCIDO' | 'FUTURO';
    notas?: string | null;
    pentamontSettled: boolean;
    receiptImageUrl?: string | null;
    receiptImagePublicId?: string | null;
    deletedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePatioPayment {
    patioTenantId: number;
    monto: number;
    fechaPago?: string;
    fechaVencimiento: string;
    metodoPago?: 'YAPE' | 'DEPOSITO' | 'TRANSFERENCIA_VIRTUAL';
    estado?: 'PAGADO' | 'VENCIDO' | 'FUTURO';
    notas?: string;
    pentamontSettled?: boolean;
    receiptImageUrl?: string;
    receiptImagePublicId?: string;
}

export interface UpdatePatioPayment {
    patioTenantId?: number;
    monto?: number;
    fechaPago?: string;
    fechaVencimiento?: string;
    metodoPago?: 'YAPE' | 'DEPOSITO' | 'TRANSFERENCIA_VIRTUAL';
    estado?: 'PAGADO' | 'VENCIDO' | 'FUTURO';
    notas?: string;
    pentamontSettled?: boolean;
    receiptImageUrl?: string;
    receiptImagePublicId?: string;
}

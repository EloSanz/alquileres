export interface PatioTenantDTO {
    id: number;
    nombre: string;
    nombreComercial: string | null;
    razonSocial: string | null;
    apodo: string | null;
    numerosLocales: string;
    telefono: string | null;
    rubro: string | null;
    montoAlquiler: number | null;
    fechaIngreso: string | null;
    estadoPago: 'AL_DIA' | 'CON_DEUDA';
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePatioTenantDTO {
    nombre: string;
    nombreComercial?: string;
    razonSocial?: string;
    apodo?: string;
    numerosLocales: string;
    telefono?: string;
    rubro?: string;
    montoAlquiler?: number;
    fechaIngreso?: string;
    estadoPago?: 'AL_DIA' | 'CON_DEUDA';
}

export interface UpdatePatioTenantDTO {
    nombre?: string;
    nombreComercial?: string;
    razonSocial?: string;
    apodo?: string;
    numerosLocales?: string;
    telefono?: string;
    rubro?: string;
    montoAlquiler?: number;
    fechaIngreso?: string;
    estadoPago?: 'AL_DIA' | 'CON_DEUDA';
}

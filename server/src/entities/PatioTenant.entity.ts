import { EstadoPago, Prisma } from '@prisma/client';
import { PatioTenantDTO } from '../dtos/patio-tenant.dto';

export class PatioTenantEntity {
    constructor(
        public id: number | null,
        public nombre: string,
        public nombreComercial: string | null,
        public razonSocial: string | null,
        public apodo: string | null,
        public numerosLocales: string,
        public telefono: string | null,
        public rubro: string | null,
        public montoAlquiler: Prisma.Decimal | null,
        public fechaIngreso: Date | null,
        public estadoPago: EstadoPago,
        public deletedAt: Date | null,
        public createdAt: Date,
        public updatedAt: Date
    ) { }

    static create(data: {
        nombre: string;
        nombreComercial?: string;
        razonSocial?: string;
        apodo?: string;
        numerosLocales: string;
        telefono?: string;
        rubro?: string;
        montoAlquiler?: number;
        fechaIngreso?: string;
        estadoPago?: string;
    }): PatioTenantEntity {
        return new PatioTenantEntity(
            null,
            data.nombre,
            data.nombreComercial || null,
            data.razonSocial || null,
            data.apodo || null,
            data.numerosLocales,
            data.telefono || null,
            data.rubro || null,
            data.montoAlquiler ? new Prisma.Decimal(data.montoAlquiler) : null,
            data.fechaIngreso ? new Date(data.fechaIngreso) : null,
            (data.estadoPago as EstadoPago) || EstadoPago.AL_DIA,
            null,
            new Date(),
            new Date()
        );
    }

    update(data: {
        nombre?: string;
        nombreComercial?: string;
        razonSocial?: string;
        apodo?: string;
        numerosLocales?: string;
        telefono?: string;
        rubro?: string;
        montoAlquiler?: number;
        fechaIngreso?: string;
        estadoPago?: string;
    }): PatioTenantEntity {
        if (data.nombre !== undefined) this.nombre = data.nombre;
        if (data.nombreComercial !== undefined) this.nombreComercial = data.nombreComercial || null;
        if (data.razonSocial !== undefined) this.razonSocial = data.razonSocial || null;
        if (data.apodo !== undefined) this.apodo = data.apodo || null;
        if (data.numerosLocales !== undefined) this.numerosLocales = data.numerosLocales;
        if (data.telefono !== undefined) this.telefono = data.telefono || null;
        if (data.rubro !== undefined) this.rubro = data.rubro || null;
        if (data.montoAlquiler !== undefined) this.montoAlquiler = data.montoAlquiler ? new Prisma.Decimal(data.montoAlquiler) : null;
        if (data.fechaIngreso !== undefined) this.fechaIngreso = data.fechaIngreso ? new Date(data.fechaIngreso) : null;
        if (data.estadoPago !== undefined) this.estadoPago = data.estadoPago as EstadoPago;
        this.updatedAt = new Date();
        return this;
    }

    static fromPrisma(prismaData: any): PatioTenantEntity {
        return new PatioTenantEntity(
            prismaData.id,
            prismaData.nombre,
            prismaData.nombreComercial,
            prismaData.razonSocial,
            prismaData.apodo,
            prismaData.numerosLocales,
            prismaData.telefono,
            prismaData.rubro,
            prismaData.montoAlquiler,
            prismaData.fechaIngreso,
            prismaData.estadoPago || EstadoPago.AL_DIA,
            prismaData.deletedAt,
            prismaData.createdAt,
            prismaData.updatedAt
        );
    }

    toPrisma() {
        return {
            id: this.id || undefined,
            nombre: this.nombre,
            nombreComercial: this.nombreComercial,
            razonSocial: this.razonSocial,
            apodo: this.apodo,
            numerosLocales: this.numerosLocales,
            telefono: this.telefono,
            rubro: this.rubro,
            montoAlquiler: this.montoAlquiler,
            fechaIngreso: this.fechaIngreso,
            estadoPago: this.estadoPago,
            deletedAt: this.deletedAt,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    toDTO(): PatioTenantDTO {
        return {
            id: this.id!,
            nombre: this.nombre,
            nombreComercial: this.nombreComercial,
            razonSocial: this.razonSocial,
            apodo: this.apodo,
            numerosLocales: this.numerosLocales,
            telefono: this.telefono,
            rubro: this.rubro,
            montoAlquiler: this.montoAlquiler ? Number(this.montoAlquiler) : null,
            fechaIngreso: this.fechaIngreso ? this.fechaIngreso.toISOString().split('T')[0] : null,
            estadoPago: this.estadoPago as 'AL_DIA' | 'CON_DEUDA',
            deletedAt: this.deletedAt ? this.deletedAt.toISOString() : null,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }
}

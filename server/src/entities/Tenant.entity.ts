// Import the enums
import { EstadoPago, Rubro } from '@prisma/client';

// Helper function to convert string to Rubro enum
function stringToRubro(value: string | null): Rubro | null {
  if (!value) return null;
  switch (value.toUpperCase()) {
    case 'TIPEO': return Rubro.TIPEO;
    case 'PEDICURE': return Rubro.PEDICURE;
    default: return null;
  }
}

export class TenantEntity {
  constructor(
    public id: number | null,
    public firstName: string,
    public lastName: string,
    public phone: string | null,
    public documentId: string,
    public address: string | null,
    public birthDate: Date | null,
    public numeroLocal: number | null | undefined,
    public rubro: Rubro | null,
    public fechaInicioContrato: Date | null,
    public estadoPago: EstadoPago,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static fromPrisma(prismaData: any): TenantEntity {
    return new TenantEntity(
      prismaData.id,
      prismaData.firstName,
      prismaData.lastName,
      prismaData.phone,
      prismaData.documentId,
      prismaData.address,
      prismaData.birthDate,
      prismaData.numeroLocal,
      stringToRubro(prismaData.rubro),
      prismaData.fechaInicioContrato,
      prismaData.estadoPago || EstadoPago.AL_DIA,
      prismaData.createdAt,
      prismaData.updatedAt
    );
  }

  toPrisma() {
    return {
      id: this.id || undefined,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      documentId: this.documentId,
      address: this.address,
      birthDate: this.birthDate,
      numeroLocal: this.numeroLocal ?? null,
      rubro: this.rubro,
      fechaInicioContrato: this.fechaInicioContrato,
      estadoPago: this.estadoPago,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toDTO(): TenantDTO {
    return {
      id: this.id!,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      documentId: this.documentId,
      address: this.address,
      birthDate: this.birthDate ? this.birthDate.toISOString() : null,
      numeroLocal: this.numeroLocal ?? null,
      rubro: this.rubro,
      fechaInicioContrato: this.fechaInicioContrato ? this.fechaInicioContrato.toISOString() : null,
      estadoPago: this.estadoPago.toString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  validate(): void {
    if (!this.firstName || this.firstName.trim().length < 2) {
      throw new Error('First name must be at least 2 characters');
    }
    if (!this.lastName || this.lastName.trim().length < 2) {
      throw new Error('Last name must be at least 2 characters');
    }
    if (!this.documentId || this.documentId.trim().length < 5) {
      throw new Error('Document ID must be at least 5 characters');
    }
    if (this.fechaInicioContrato && this.fechaInicioContrato > new Date()) {
      throw new Error('Contract start date cannot be in the future');
    }
  }
}

// DTO types
export interface TenantDTO {
  id: number;
  firstName: string;
  lastName: string;
  phone: string | null;
  documentId: string;
  address: string | null;
  birthDate: string | null;
  numeroLocal: number | null;
  rubro: Rubro | null;
  fechaInicioContrato: string | null;
  estadoPago: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantDTO {
  firstName: string;
  lastName: string;
  phone?: string;
  documentId: string;
  address?: string;
  birthDate?: string;
  numeroLocal?: string;
  rubro?: string;
  fechaInicioContrato?: string;
}

export interface UpdateTenantDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  numeroLocal?: string;
  rubro?: string;
  fechaInicioContrato?: string;
}

// Import the enum
import { PropertyStatus, UbicacionType } from '@prisma/client';
import { PropertyDTO } from '../dtos/property.dto';

export class PropertyEntity {
  constructor(
    public id: number | null,
    public localNumber: number,
    public ubicacion: UbicacionType,
    public zipCode: string | null,
    public propertyType: PropertyType,
    public bedrooms: number | null,
    public bathrooms: number | null,
    public areaSqm: number | null,
    public monthlyRent: number,
    public description: string | null,
    public isAvailable: boolean,
    public status: PropertyStatus,
    public tenantId: number | null,
    public createdAt: Date,
    public updatedAt: Date
  ) {  }

  static create(data: {
    localNumber: number;
    ubicacion: string;
    zipCode?: string;
    propertyType: string;
    bedrooms?: number;
    bathrooms?: number;
    areaSqm?: number;
    monthlyRent: number;
    description?: string;
    isAvailable?: boolean;
    tenantId: number | null;
  }): PropertyEntity {
    return new PropertyEntity(
      null, // id
      data.localNumber,
      data.ubicacion as UbicacionType,
      data.zipCode || null,
      data.propertyType as PropertyType,
      data.bedrooms || null,
      data.bathrooms || null,
      data.areaSqm || null,
      data.monthlyRent,
      data.description || null,
      data.isAvailable ?? true,
      PropertyStatus.ACTIVE, // status
      data.tenantId,
      new Date(), // createdAt
      new Date()  // updatedAt
    );
  }

  update(data: {
    localNumber?: number;
    ubicacion?: string;
    zipCode?: string;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    areaSqm?: number;
    monthlyRent?: number;
    description?: string;
    isAvailable?: boolean;
    status?: PropertyStatus;
    tenantId?: number | null;
  }): PropertyEntity {
    if (data.localNumber !== undefined) this.localNumber = data.localNumber;
    if (data.ubicacion !== undefined) this.ubicacion = data.ubicacion as UbicacionType;
    if (data.zipCode !== undefined) this.zipCode = data.zipCode;
    if (data.propertyType !== undefined) this.propertyType = data.propertyType as PropertyType;
    if (data.bedrooms !== undefined) this.bedrooms = data.bedrooms;
    if (data.bathrooms !== undefined) this.bathrooms = data.bathrooms;
    if (data.areaSqm !== undefined) this.areaSqm = data.areaSqm;
    if (data.monthlyRent !== undefined) this.monthlyRent = data.monthlyRent;
    if (data.description !== undefined) this.description = data.description;
    if (data.isAvailable !== undefined) this.isAvailable = data.isAvailable;
    if (data.status !== undefined) this.status = data.status;
    if (data.tenantId !== undefined) this.tenantId = data.tenantId;
    this.updatedAt = new Date();
    this.validate();
    return this;
  }

  static fromPrisma(prismaData: any): PropertyEntity {
    return new PropertyEntity(
      prismaData.id,
      prismaData.localNumber,
      prismaData.ubicacion,
      prismaData.zipCode,
      prismaData.propertyType,
      prismaData.bedrooms,
      prismaData.bathrooms,
      prismaData.areaSqm,
      Number(prismaData.monthlyRent),
      prismaData.description,
      prismaData.isAvailable,
      prismaData.status as PropertyStatus || PropertyStatus.ACTIVE,
      prismaData.tenantId,
      prismaData.createdAt,
      prismaData.updatedAt
    );
  }

  toPrisma() {
    return {
      id: this.id || undefined,
      localNumber: this.localNumber,
      ubicacion: this.ubicacion,
      zipCode: this.zipCode,
      propertyType: this.propertyType,
      bedrooms: this.bedrooms,
      bathrooms: this.bathrooms,
      areaSqm: this.areaSqm,
      monthlyRent: this.monthlyRent,
      description: this.description,
      isAvailable: this.isAvailable,
      status: this.status,
      tenantId: this.tenantId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toDTO(): PropertyDTO {
    return {
      id: this.id!,
      localNumber: this.localNumber,
      ubicacion: this.ubicacion,
      zipCode: this.zipCode,
      propertyType: this.propertyType,
      bedrooms: this.bedrooms,
      bathrooms: this.bathrooms,
      areaSqm: this.areaSqm,
      monthlyRent: this.monthlyRent,
      description: this.description,
      isAvailable: this.isAvailable,
      status: this.status.toString(),
      tenantId: this.tenantId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  validate(): void {
    if (!this.localNumber || this.localNumber <= 0) {
      throw new Error('Local number must be greater than 0');
    }
    if (!this.ubicacion) {
      throw new Error('Ubicacion is required');
    }
    if (this.monthlyRent <= 0) {
      throw new Error('Monthly rent must be greater than 0');
    }
  }
}

// Enums
export enum PropertyType {
  INSIDE = 'INSIDE',  // Local adentro
  OUTSIDE = 'OUTSIDE' // Local afuera
}


// Import the enum
import { PropertyStatus } from '@prisma/client';
import { PropertyDTO } from '../dtos/property.dto';

export class PropertyEntity {
  constructor(
    public id: number | null,
    public name: string,
    public localNumber: number,
    public state: string,
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
    name: string;
    localNumber: number;
    state: string;
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
      data.name,
      data.localNumber,
      data.state,
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
    name?: string;
    localNumber?: number;
    state?: string;
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
    if (data.name !== undefined) this.name = data.name;
    if (data.localNumber !== undefined) this.localNumber = data.localNumber;
    if (data.state !== undefined) this.state = data.state;
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
      prismaData.name,
      prismaData.localNumber,
      prismaData.state,
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
      name: this.name,
      localNumber: this.localNumber,
      state: this.state,
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
      name: this.name,
      localNumber: this.localNumber,
      state: this.state,
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
    if (!this.name || this.name.trim().length < 3) {
      throw new Error('Property name must be at least 3 characters');
    }
    if (!this.localNumber || this.localNumber <= 0) {
      throw new Error('Local number must be greater than 0');
    }
    if (!this.state || this.state.trim().length < 2) {
      throw new Error('State must be at least 2 characters');
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


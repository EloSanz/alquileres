// Import the enum
import { PropertyStatus } from '@prisma/client';

export class PropertyEntity {
  constructor(
    public id: number | null,
    public name: string,
    public address: string,
    public city: string,
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
    address: string;
    city: string;
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
      data.address,
      data.city,
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
    address?: string;
    city?: string;
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
    if (data.address !== undefined) this.address = data.address;
    if (data.city !== undefined) this.city = data.city;
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
      prismaData.address,
      prismaData.city,
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
      address: this.address,
      city: this.city,
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
      address: this.address,
      city: this.city,
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
    if (!this.address || this.address.trim().length < 5) {
      throw new Error('Address must be at least 5 characters');
    }
    if (!this.city || this.city.trim().length < 2) {
      throw new Error('City must be at least 2 characters');
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

// DTO types
export interface PropertyDTO {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string | null;
  propertyType: PropertyType;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number | null;
  monthlyRent: number;
  description: string | null;
  isAvailable: boolean;
  status: string;
  tenantId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyDTO {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  propertyType: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  monthlyRent: number;
  description?: string;
  isAvailable?: boolean;
}

export interface UpdatePropertyDTO {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  propertyType?: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  monthlyRent?: number;
  description?: string;
  isAvailable?: boolean;
}

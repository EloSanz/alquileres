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
    public createdAt: Date,
    public updatedAt: Date
  ) {}

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
      prismaData.createdAt,
      prismaData.updatedAt
    );
  }

  toPrisma() {
    return {
      id: this.id,
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
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  STUDIO = 'STUDIO',
  OFFICE = 'OFFICE',
  COMMERCIAL = 'COMMERCIAL',
  LAND = 'LAND'
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

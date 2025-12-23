export class TenantEntity {
  constructor(
    public id: number | null,
    public firstName: string,
    public lastName: string,
    public email: string,
    public phone: string | null,
    public documentId: string,
    public address: string | null,
    public birthDate: Date | null,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static fromPrisma(prismaData: any): TenantEntity {
    return new TenantEntity(
      prismaData.id,
      prismaData.firstName,
      prismaData.lastName,
      prismaData.email,
      prismaData.phone,
      prismaData.documentId,
      prismaData.address,
      prismaData.birthDate,
      prismaData.createdAt,
      prismaData.updatedAt
    );
  }

  toPrisma() {
    return {
      id: this.id || undefined,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      documentId: this.documentId,
      address: this.address,
      birthDate: this.birthDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toDTO(): TenantDTO {
    return {
      id: this.id!,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      documentId: this.documentId,
      address: this.address,
      birthDate: this.birthDate ? this.birthDate.toISOString() : null,
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
    if (!this.email || !this.email.includes('@')) {
      throw new Error('Invalid email address');
    }
    if (!this.documentId || this.documentId.trim().length < 5) {
      throw new Error('Document ID must be at least 5 characters');
    }
  }
}

// DTO types
export interface TenantDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  documentId: string;
  address: string | null;
  birthDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  documentId: string;
  address?: string;
  birthDate?: string;
}

export interface UpdateTenantDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
}

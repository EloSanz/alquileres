// Import the enum
import { PropertyStatus, UbicacionType } from '@prisma/client';
import { PropertyDTO } from '../dtos/property.dto';

export class PropertyEntity {
  constructor(
    public id: number | null,
    public localNumber: number,
    public ubicacion: UbicacionType,
    public monthlyRent: number,
    public status: PropertyStatus,
    public tenantId: number | null,
    public createdAt: Date,
    public updatedAt: Date
  ) { }

  static create(data: {
    localNumber: number;
    ubicacion: string;
    monthlyRent: number;
    tenantId: number | null;
  }): PropertyEntity {
    return new PropertyEntity(
      null, // id
      data.localNumber,
      data.ubicacion as UbicacionType,
      data.monthlyRent,
      PropertyStatus.ACTIVE, // status
      data.tenantId,
      new Date(), // createdAt
      new Date()  // updatedAt
    );
  }

  update(data: {
    localNumber?: number;
    ubicacion?: string;
    monthlyRent?: number;
    status?: PropertyStatus;
    tenantId?: number | null;
  }): PropertyEntity {
    if (data.localNumber !== undefined) this.localNumber = data.localNumber;
    if (data.ubicacion !== undefined) this.ubicacion = data.ubicacion as UbicacionType;
    if (data.monthlyRent !== undefined) this.monthlyRent = data.monthlyRent;
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
      Number(prismaData.monthlyRent),
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
      monthlyRent: this.monthlyRent,
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
      monthlyRent: this.monthlyRent,
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


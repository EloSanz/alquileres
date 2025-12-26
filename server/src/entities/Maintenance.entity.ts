// MaintenanceType and MaintenanceStatus enums - matches Prisma enum
export type MaintenanceType = 'REPARACION' | 'LIMPIEZA' | 'PINTURA' | 'ELECTRICIDAD' | 'PLOMERIA' | 'JARDINERIA' | 'OTROS';
export type MaintenanceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
import { MaintenanceDTO } from '../dtos/maintenance.dto';
import { Maintenance } from '../../../shared/types/Maintenance';

export class MaintenanceEntity {
  constructor(
    public id: number | null,
    public propertyId: number | null,
    public contractId: number | null,
    public maintenanceType: MaintenanceType,
    public description: string,
    public estimatedCost: number | null,
    public actualCost: number | null,
    public scheduledDate: Date | null,
    public completedDate: Date | null,
    public status: MaintenanceStatus,
    public notes: string | null,
    public createdAt: Date,
    public updatedAt: Date
  ) { }

  static create(data: {
    propertyId: number | null;
    contractId?: number | null;
    maintenanceType: string;
    description: string;
    estimatedCost?: number | null;
    actualCost?: number | null;
    scheduledDate?: string | null;
    completedDate?: string | null;
    status?: string;
    notes?: string;
  }): MaintenanceEntity {
    return new MaintenanceEntity(
      null, // id
      data.propertyId,
      data.contractId || null,
      data.maintenanceType as MaintenanceType,
      data.description,
      data.estimatedCost || null,
      data.actualCost || null,
      data.scheduledDate ? new Date(data.scheduledDate) : null,
      data.completedDate ? new Date(data.completedDate) : null,
      (data.status as MaintenanceStatus) || 'PENDING',
      data.notes || null,
      new Date(), // createdAt
      new Date()  // updatedAt
    );
  }

  update(data: {
    propertyId?: number | null;
    contractId?: number | null;
    maintenanceType?: string;
    description?: string;
    estimatedCost?: number | null;
    actualCost?: number | null;
    scheduledDate?: string | null;
    completedDate?: string | null;
    status?: string;
    notes?: string;
  }): MaintenanceEntity {
    if (data.propertyId !== undefined) this.propertyId = data.propertyId;
    if (data.contractId !== undefined) this.contractId = data.contractId;
    if (data.maintenanceType !== undefined) this.maintenanceType = data.maintenanceType as MaintenanceType;
    if (data.description !== undefined) this.description = data.description;
    if (data.estimatedCost !== undefined) this.estimatedCost = data.estimatedCost;
    if (data.actualCost !== undefined) this.actualCost = data.actualCost;
    if (data.scheduledDate !== undefined) this.scheduledDate = data.scheduledDate ? new Date(data.scheduledDate) : null;
    if (data.completedDate !== undefined) this.completedDate = data.completedDate ? new Date(data.completedDate) : null;
    if (data.status !== undefined) this.status = data.status as MaintenanceStatus;
    if (data.notes !== undefined) this.notes = data.notes;
    this.updatedAt = new Date();
    this.validate();
    return this;
  }

  static fromPrisma(prismaData: any): MaintenanceEntity {
    return new MaintenanceEntity(
      prismaData.id,
      prismaData.propertyId,
      prismaData.contractId,
      prismaData.maintenanceType as MaintenanceType,
      prismaData.description,
      prismaData.estimatedCost ? Number(prismaData.estimatedCost) : null,
      prismaData.actualCost ? Number(prismaData.actualCost) : null,
      prismaData.scheduledDate,
      prismaData.completedDate,
      prismaData.status as MaintenanceStatus,
      prismaData.notes,
      prismaData.createdAt,
      prismaData.updatedAt
    );
  }

  toPrisma() {
    return {
      id: this.id || undefined,
      propertyId: this.propertyId,
      contractId: this.contractId,
      maintenanceType: this.maintenanceType,
      description: this.description,
      estimatedCost: this.estimatedCost,
      actualCost: this.actualCost,
      scheduledDate: this.scheduledDate,
      completedDate: this.completedDate,
      status: this.status,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toDTO(): MaintenanceDTO {
    return Maintenance.fromJSON({
      id: this.id!,
      propertyId: this.propertyId,
      contractId: this.contractId,
      maintenanceType: this.maintenanceType,
      description: this.description,
      estimatedCost: this.estimatedCost,
      actualCost: this.actualCost,
      scheduledDate: this.scheduledDate ? this.scheduledDate.toISOString().split('T')[0] : null,
      completedDate: this.completedDate ? this.completedDate.toISOString().split('T')[0] : null,
      status: this.status.toString(),
      notes: this.notes,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    });
  }

  validate(): void {
    if (!this.description || this.description.trim().length === 0) {
      throw new Error('Maintenance description is required');
    }
    const validTypes: MaintenanceType[] = ['REPARACION', 'LIMPIEZA', 'PINTURA', 'ELECTRICIDAD', 'PLOMERIA', 'JARDINERIA', 'OTROS'];
    if (!validTypes.includes(this.maintenanceType)) {
      throw new Error(`Invalid maintenance type: ${this.maintenanceType}`);
    }
    const validStatuses: MaintenanceStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(this.status)) {
      throw new Error(`Invalid maintenance status: ${this.status}`);
    }
  }
}


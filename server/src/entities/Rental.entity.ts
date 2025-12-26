import { RentalDTO } from '../dtos/rental.dto';
import { Rental } from '../../../shared/types/Rental';

export class RentalEntity {
  constructor(
    public id: number | null,
    public tenantId: number,
    public propertyId: number,
    public startDate: Date,
    public endDate: Date | null,
    public monthlyRent: number,
    public depositAmount: number | null,
    public status: RentalStatus,
    public notes: string | null,
    public createdAt: Date,
    public updatedAt: Date
  ) {  }

  static create(data: {
    tenantId: number;
    propertyId: number;
    startDate: string;
    endDate?: string;
    monthlyRent: number;
    depositAmount?: number;
    status?: string;
    notes?: string;
  }): RentalEntity {
    return new RentalEntity(
      null, // id
      data.tenantId,
      data.propertyId,
      new Date(data.startDate),
      data.endDate ? new Date(data.endDate) : null,
      data.monthlyRent,
      data.depositAmount || null,
      (data.status as RentalStatus) || 'ACTIVE',
      data.notes || null,
      new Date(), // createdAt
      new Date()  // updatedAt
    );
  }

  update(data: {
    tenantId?: number;
    propertyId?: number;
    startDate?: string;
    endDate?: string;
    monthlyRent?: number;
    depositAmount?: number;
    status?: string;
    notes?: string;
  }): RentalEntity {
    if (data.tenantId !== undefined) this.tenantId = data.tenantId;
    if (data.propertyId !== undefined) this.propertyId = data.propertyId;
    if (data.startDate !== undefined) this.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) this.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.monthlyRent !== undefined) this.monthlyRent = data.monthlyRent;
    if (data.depositAmount !== undefined) this.depositAmount = data.depositAmount;
    if (data.status !== undefined) this.status = data.status as RentalStatus;
    if (data.notes !== undefined) this.notes = data.notes;
    this.updatedAt = new Date();
    this.validate();
    return this;
  }

  static fromPrisma(prismaData: any): RentalEntity {
    return new RentalEntity(
      prismaData.id,
      prismaData.tenantId,
      prismaData.propertyId,
      prismaData.startDate,
      prismaData.endDate,
      Number(prismaData.monthlyRent),
      prismaData.depositAmount ? Number(prismaData.depositAmount) : null,
      prismaData.status,
      prismaData.notes,
      prismaData.createdAt,
      prismaData.updatedAt
    );
  }

  toPrisma() {
    return {
      id: this.id || undefined,
      tenantId: this.tenantId,
      propertyId: this.propertyId,
      startDate: this.startDate,
      endDate: this.endDate,
      monthlyRent: this.monthlyRent,
      depositAmount: this.depositAmount,
      status: this.status,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toDTO(): RentalDTO {
    return Rental.fromJSON({
      id: this.id!,
      tenantId: this.tenantId,
      propertyId: this.propertyId,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate?.toISOString() || null,
      monthlyRent: this.monthlyRent,
      depositAmount: this.depositAmount,
      status: this.status.toString(),
      notes: this.notes,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    });
  }

  validate(): void {
    if (this.monthlyRent <= 0) {
      throw new Error('Monthly rent must be greater than 0');
    }
    if (this.endDate && this.startDate >= this.endDate) {
      throw new Error('End date must be after start date');
    }
    if (this.depositAmount !== null && this.depositAmount < 0) {
      throw new Error('Deposit amount cannot be negative');
    }
  }

  isActive(): boolean {
    return this.status === RentalStatus.ACTIVE;
  }

  isOverdue(): boolean {
    if (!this.endDate) return false;
    return new Date() > this.endDate && this.status === RentalStatus.ACTIVE;
  }
}

// Enums
export enum RentalStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  TERMINATED = 'TERMINATED'
}


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
  ) {}

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
    return {
      id: this.id!,
      tenantId: this.tenantId,
      propertyId: this.propertyId,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate?.toISOString() || null,
      monthlyRent: this.monthlyRent,
      depositAmount: this.depositAmount,
      status: this.status,
      notes: this.notes,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
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

// DTO types
export interface RentalDTO {
  id: number;
  tenantId: number;
  propertyId: number;
  startDate: string;
  endDate: string | null;
  monthlyRent: number;
  depositAmount: number | null;
  status: RentalStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRentalDTO {
  tenantId: number;
  propertyId: number;
  startDate: string;
  endDate?: string;
  monthlyRent: number;
  depositAmount?: number;
  status?: RentalStatus;
  notes?: string;
}

export interface UpdateRentalDTO {
  startDate?: string;
  endDate?: string;
  monthlyRent?: number;
  depositAmount?: number;
  status?: RentalStatus;
  notes?: string;
}

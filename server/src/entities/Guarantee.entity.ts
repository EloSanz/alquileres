// GuaranteeType enum - matches Prisma enum
export type GuaranteeType = 'DEPOSITO' | 'FIANZA' | 'SEGURO' | 'OTROS';

export class GuaranteeEntity {
  constructor(
    public id: number | null,
    public propertyId: number | null,
    public contractId: number | null,
    public tenantId: number | null,
    public guaranteeType: GuaranteeType,
    public amount: number,
    public depositDate: Date,
    public returnDate: Date | null,
    public isReturned: boolean,
    public notes: string | null,
    public createdAt: Date,
    public updatedAt: Date
  ) { }

  static create(data: {
    propertyId: number | null;
    contractId?: number | null;
    tenantId?: number | null;
    guaranteeType: string;
    amount: number;
    depositDate?: string;
    returnDate?: string | null;
    isReturned?: boolean;
    notes?: string;
  }): GuaranteeEntity {
    return new GuaranteeEntity(
      null, // id
      data.propertyId,
      data.contractId || null,
      data.tenantId || null,
      data.guaranteeType as GuaranteeType,
      data.amount,
      data.depositDate ? new Date(data.depositDate) : new Date(),
      data.returnDate ? new Date(data.returnDate) : null,
      data.isReturned ?? false,
      data.notes || null,
      new Date(), // createdAt
      new Date()  // updatedAt
    );
  }

  update(data: {
    propertyId?: number | null;
    contractId?: number | null;
    tenantId?: number | null;
    guaranteeType?: string;
    amount?: number;
    depositDate?: string;
    returnDate?: string | null;
    isReturned?: boolean;
    notes?: string;
  }): GuaranteeEntity {
    if (data.propertyId !== undefined) this.propertyId = data.propertyId;
    if (data.contractId !== undefined) this.contractId = data.contractId;
    if (data.tenantId !== undefined) this.tenantId = data.tenantId;
    if (data.guaranteeType !== undefined) this.guaranteeType = data.guaranteeType as GuaranteeType;
    if (data.amount !== undefined) this.amount = data.amount;
    if (data.depositDate !== undefined) this.depositDate = new Date(data.depositDate);
    if (data.returnDate !== undefined) this.returnDate = data.returnDate ? new Date(data.returnDate) : null;
    if (data.isReturned !== undefined) this.isReturned = data.isReturned;
    if (data.notes !== undefined) this.notes = data.notes;
    this.updatedAt = new Date();
    this.validate();
    return this;
  }

  static fromPrisma(prismaData: any): GuaranteeEntity {
    return new GuaranteeEntity(
      prismaData.id,
      prismaData.propertyId,
      prismaData.contractId,
      prismaData.tenantId,
      prismaData.guaranteeType as GuaranteeType,
      Number(prismaData.amount),
      prismaData.depositDate,
      prismaData.returnDate,
      prismaData.isReturned ?? false,
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
      tenantId: this.tenantId,
      guaranteeType: this.guaranteeType,
      amount: this.amount,
      depositDate: this.depositDate,
      returnDate: this.returnDate,
      isReturned: this.isReturned,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toDTO(): GuaranteeDTO {
    return {
      id: this.id!,
      propertyId: this.propertyId,
      contractId: this.contractId,
      tenantId: this.tenantId,
      guaranteeType: this.guaranteeType,
      amount: this.amount,
      depositDate: this.depositDate.toISOString().split('T')[0],
      returnDate: this.returnDate ? this.returnDate.toISOString().split('T')[0] : null,
      isReturned: this.isReturned,
      notes: this.notes,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  validate(): void {
    if (this.amount <= 0) {
      throw new Error('Guarantee amount must be greater than 0');
    }
    const validTypes: GuaranteeType[] = ['DEPOSITO', 'FIANZA', 'SEGURO', 'OTROS'];
    if (!validTypes.includes(this.guaranteeType)) {
      throw new Error(`Invalid guarantee type: ${this.guaranteeType}`);
    }
  }
}

// DTO types
export interface GuaranteeDTO {
  id: number;
  propertyId: number | null;
  contractId: number | null;
  tenantId: number | null;
  guaranteeType: string;
  amount: number;
  depositDate: string;
  returnDate: string | null;
  isReturned: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGuaranteeDTO {
  propertyId: number | null;
  contractId: number | null;
  tenantId: number | null;
  guaranteeType: string;
  amount: number;
  depositDate?: string;
  returnDate?: string | null;
  isReturned?: boolean;
  notes?: string;
}

export interface UpdateGuaranteeDTO {
  propertyId?: number | null;
  contractId?: number | null;
  tenantId?: number | null;
  guaranteeType?: string;
  amount?: number;
  depositDate?: string;
  returnDate?: string | null;
  isReturned?: boolean;
  notes?: string;
}

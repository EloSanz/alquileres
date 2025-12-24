export class PaymentEntity {
  constructor(
    public id: number | null,
    public tenantId: number | null,
    public propertyId: number,
    public contractId: number | null,
    public monthNumber: number | null,
    public tenantFullName: string | null,
    public tenantPhone: string | null,
    public amount: number,
    public paymentDate: Date,
    public dueDate: Date,
    public notes: string | null,
    public createdAt: Date,
    public updatedAt: Date
  ) {  }

  static create(data: {
    tenantId: number | null;
    propertyId: number;
    contractId?: number | null;
    monthNumber?: number | null;
    tenantFullName?: string | null;
    tenantPhone?: string | null;
    amount: number;
    paymentDate?: string;
    dueDate: string;
    notes?: string;
  }): PaymentEntity {
    return new PaymentEntity(
      null, // id
      data.tenantId,
      data.propertyId,
      data.contractId || null,
      data.monthNumber || null,
      data.tenantFullName || null,
      data.tenantPhone || null,
      data.amount,
      data.paymentDate ? new Date(data.paymentDate) : new Date(),
      new Date(data.dueDate),
      data.notes || null,
      new Date(), // createdAt
      new Date()  // updatedAt
    );
  }

  update(data: {
    tenantId?: number | null;
    propertyId?: number;
    contractId?: number | null;
    monthNumber?: number | null;
    tenantFullName?: string | null;
    tenantPhone?: string | null;
    amount?: number;
    paymentDate?: string;
    dueDate?: string;
    notes?: string;
  }): PaymentEntity {
    if (data.tenantId !== undefined) this.tenantId = data.tenantId;
    if (data.propertyId !== undefined) this.propertyId = data.propertyId;
    if (data.contractId !== undefined) this.contractId = data.contractId;
    if (data.monthNumber !== undefined) this.monthNumber = data.monthNumber;
    if (data.tenantFullName !== undefined) this.tenantFullName = data.tenantFullName;
    if (data.tenantPhone !== undefined) this.tenantPhone = data.tenantPhone;
    if (data.amount !== undefined) this.amount = data.amount;
    if (data.paymentDate !== undefined) this.paymentDate = new Date(data.paymentDate);
    if (data.dueDate !== undefined) this.dueDate = new Date(data.dueDate);
    if (data.notes !== undefined) this.notes = data.notes;
    this.updatedAt = new Date();
    this.validate();
    return this;
  }

  static fromPrisma(prismaData: any): PaymentEntity {
    return new PaymentEntity(
      prismaData.id,
      prismaData.tenantId,
      prismaData.propertyId,
      prismaData.contractId,
      prismaData.monthNumber,
      prismaData.tenantFullName,
      prismaData.tenantPhone,
      Number(prismaData.amount),
      prismaData.paymentDate,
      prismaData.dueDate,
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
      contractId: this.contractId,
      monthNumber: this.monthNumber,
      tenantFullName: this.tenantFullName,
      tenantPhone: this.tenantPhone,
      amount: this.amount,
      paymentDate: this.paymentDate,
      dueDate: this.dueDate,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toDTO(): PaymentDTO {
    return {
      id: this.id!,
      tenantId: this.tenantId,
      propertyId: this.propertyId,
      contractId: this.contractId,
      monthNumber: this.monthNumber,
      tenantFullName: this.tenantFullName,
      tenantPhone: this.tenantPhone,
      amount: this.amount,
      paymentDate: this.paymentDate.toISOString().split('T')[0],
      dueDate: this.dueDate.toISOString().split('T')[0],
      notes: this.notes,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  validate(): void {
    if (this.amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }
    if (this.paymentDate > this.dueDate) {
      throw new Error('Payment date cannot be after due date');
    }
    if (this.contractId !== null && (this.monthNumber === null || this.monthNumber < 1 || this.monthNumber > 12)) {
      throw new Error('Month number must be between 1 and 12 when contractId is set');
    }
  }
}

// DTO types
export interface PaymentDTO {
  id: number;
  tenantId: number | null;
  propertyId: number;
  contractId: number | null;
  monthNumber: number | null;
  tenantFullName: string | null;
  tenantPhone: string | null;
  amount: number;
  paymentDate: string;
  dueDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDTO {
  rentalId: number;
  amount: number;
  paymentDate?: string;
  dueDate: string;
  notes?: string;
}

export interface UpdatePaymentDTO {
  amount?: number;
  paymentDate?: string;
  dueDate?: string;
  notes?: string;
}

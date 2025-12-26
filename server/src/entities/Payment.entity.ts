// Import the enum
import { PaymentMethod } from '@prisma/client';

export class PaymentEntity {
  constructor(
    public id: number | null,
    public tenantId: number | null,
    public propertyId: number | null,
    public contractId: number | null,
    public monthNumber: number | null,
    public tenantFullName: string | null,
    public tenantPhone: string | null,
    public amount: number,
    public paymentDate: Date,
    public dueDate: Date,
    public paymentMethod: PaymentMethod,
    public pentamontSettled: boolean,
    public notes: string | null,
    public receiptImageUrl: string | null,
    public createdAt: Date,
    public updatedAt: Date
  ) {  }

  static create(data: {
    tenantId: number | null;
    propertyId: number | null;
    contractId?: number | null;
    monthNumber?: number | null;
    tenantFullName?: string | null;
    tenantPhone?: string | null;
    amount: number;
    paymentDate?: string;
    dueDate: string;
    paymentMethod?: string;
    pentamontSettled?: boolean;
    notes?: string;
    receiptImageUrl?: string | null;
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
      (data.paymentMethod as PaymentMethod) || PaymentMethod.YAPE,
      data.pentamontSettled ?? false,
      data.notes || null,
      data.receiptImageUrl || null,
      new Date(), // createdAt
      new Date()  // updatedAt
    );
  }

  update(data: {
    tenantId?: number | null;
    propertyId?: number | null;
    contractId?: number | null;
    monthNumber?: number | null;
    tenantFullName?: string | null;
    tenantPhone?: string | null;
    amount?: number;
    paymentDate?: string;
    dueDate?: string;
    paymentMethod?: string;
    pentamontSettled?: boolean;
    notes?: string;
    receiptImageUrl?: string | null;
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
    if (data.paymentMethod !== undefined) this.paymentMethod = data.paymentMethod as PaymentMethod;
    if (data.pentamontSettled !== undefined) this.pentamontSettled = data.pentamontSettled;
    if (data.notes !== undefined) this.notes = data.notes;
    if (data.receiptImageUrl !== undefined) this.receiptImageUrl = data.receiptImageUrl;
    this.updatedAt = new Date();
    this.validate();
    return this;
  }

  static fromPrisma(prismaData: any): PaymentEntity {
    const entity = new PaymentEntity(
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
      prismaData.paymentMethod,
      prismaData.pentamontSettled ?? false,
      prismaData.notes,
      prismaData.receiptImageUrl || null,
      prismaData.createdAt,
      prismaData.updatedAt
    );
    // Agregar datos de relaciones si están disponibles
    if (prismaData.tenant) {
      (entity as any).tenantFullName = `${prismaData.tenant.firstName} ${prismaData.tenant.lastName}`;
      (entity as any).tenantPhone = prismaData.tenant.phone;
    }
    return entity;
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
      paymentMethod: this.paymentMethod,
      pentamontSettled: this.pentamontSettled,
      notes: this.notes,
      receiptImageUrl: this.receiptImageUrl,
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
      paymentMethod: this.paymentMethod,
      pentamontSettled: this.pentamontSettled,
      notes: this.notes,
      // Por ahora, todos los pagos devuelven la misma URL de imagen
      // En el futuro, se puede usar this.receiptImageUrl si está disponible
      receiptImageUrl: this.receiptImageUrl || '/comprobante.png',
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  validate(): void {
    if (this.amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
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
  propertyId: number | null;
  contractId: number | null;
  monthNumber: number | null;
  tenantFullName: string | null;
  tenantPhone: string | null;
  amount: number;
  paymentDate: string;
  dueDate: string;
  paymentMethod: string;
  pentamontSettled: boolean;
  notes: string | null;
  receiptImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDTO {
  rentalId: number;
  amount: number;
  paymentDate?: string;
  dueDate: string;
  pentamontSettled?: boolean;
  notes?: string;
}

export interface UpdatePaymentDTO {
  amount?: number;
  paymentDate?: string;
  dueDate?: string;
  pentamontSettled?: boolean;
  notes?: string;
}

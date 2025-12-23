export class PaymentEntity {
  constructor(
    public id: number | null,
    public rentalId: number,
    public amount: number,
    public paymentDate: Date,
    public dueDate: Date,
    public paymentType: PaymentType,
    public status: PaymentStatus,
    public notes: string | null,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static fromPrisma(prismaData: any): PaymentEntity {
    return new PaymentEntity(
      prismaData.id,
      prismaData.rentalId,
      Number(prismaData.amount),
      prismaData.paymentDate,
      prismaData.dueDate,
      prismaData.paymentType,
      prismaData.status,
      prismaData.notes,
      prismaData.createdAt,
      prismaData.updatedAt
    );
  }

  toPrisma() {
    return {
      id: this.id,
      rentalId: this.rentalId,
      amount: this.amount,
      paymentDate: this.paymentDate,
      dueDate: this.dueDate,
      paymentType: this.paymentType,
      status: this.status,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toDTO(): PaymentDTO {
    return {
      id: this.id!,
      rentalId: this.rentalId,
      amount: this.amount,
      paymentDate: this.paymentDate.toISOString(),
      dueDate: this.dueDate.toISOString(),
      paymentType: this.paymentType,
      status: this.status,
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
  }
}

// Enums
export enum PaymentType {
  RENT = 'RENT',
  DEPOSIT = 'DEPOSIT',
  MAINTENANCE = 'MAINTENANCE',
  LATE_FEE = 'LATE_FEE',
  OTHER = 'OTHER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

// DTO types
export interface PaymentDTO {
  id: number;
  rentalId: number;
  amount: number;
  paymentDate: string;
  dueDate: string;
  paymentType: PaymentType;
  status: PaymentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDTO {
  rentalId: number;
  amount: number;
  paymentDate?: string;
  dueDate: string;
  paymentType: PaymentType;
  status?: PaymentStatus;
  notes?: string;
}

export interface UpdatePaymentDTO {
  amount?: number;
  paymentDate?: string;
  dueDate?: string;
  paymentType?: PaymentType;
  status?: PaymentStatus;
  notes?: string;
}

// Import the enum
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { PaymentStatus as FrontendPaymentStatus } from '../../../shared/types/Payment';
import { PaymentDTO } from '../dtos/payment.dto';
import { Payment } from '../../../shared/types/Payment';

// Helper function to convert frontend PaymentStatus to Prisma PaymentStatus
function convertFrontendStatusToPrisma(frontendStatus: string | FrontendPaymentStatus): PaymentStatus {
  switch (frontendStatus) {
    case FrontendPaymentStatus.PAGADO:
    case 'PAGADO':
      return PaymentStatus.PAGADO;
    case FrontendPaymentStatus.VENCIDO:
    case 'VENCIDO':
      return PaymentStatus.VENCIDO;
    case FrontendPaymentStatus.FUTURO:
    case 'FUTURO':
      return PaymentStatus.FUTURO;
    default:
      console.warn('[PaymentEntity] Unknown status:', frontendStatus, 'defaulting to FUTURO');
      return PaymentStatus.FUTURO;
  }
}

// Helper function to convert Prisma PaymentStatus to frontend PaymentStatus
function convertPrismaStatusToFrontend(prismaStatus: PaymentStatus): FrontendPaymentStatus {
  switch (prismaStatus) {
    case PaymentStatus.PAGADO:
      return FrontendPaymentStatus.PAGADO;
    case PaymentStatus.VENCIDO:
      return FrontendPaymentStatus.VENCIDO;
    case PaymentStatus.FUTURO:
      return FrontendPaymentStatus.FUTURO;
    default:
      console.warn('[PaymentEntity] Unknown Prisma status:', prismaStatus, 'defaulting to FUTURO');
      return FrontendPaymentStatus.FUTURO;
  }
}

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
    public status: PaymentStatus,
    public pentamontSettled: boolean,
    public notes: string | null,
    public receiptImageUrl: string | null,
    public createdAt: Date,
    public updatedAt: Date
  ) {  }

  // calculateStatus removido - el status solo se cambia manualmente por el usuario

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
    status?: PaymentStatus;
    pentamontSettled?: boolean;
    notes?: string;
    receiptImageUrl?: string | null;
  }): PaymentEntity {
    const paymentDate = data.paymentDate ? new Date(data.paymentDate) : new Date();
    const dueDate = new Date(data.dueDate);
    const entity = new PaymentEntity(
      null, // id
      data.tenantId,
      data.propertyId,
      data.contractId || null,
      data.monthNumber || null,
      data.tenantFullName || null,
      data.tenantPhone || null,
      data.amount,
      paymentDate,
      dueDate,
      (data.paymentMethod as PaymentMethod) || PaymentMethod.YAPE,
      convertFrontendStatusToPrisma(data.status || FrontendPaymentStatus.VENCIDO), // Por defecto VENCIDO (impago) hasta que el usuario lo cambie
      data.pentamontSettled ?? false,
      data.notes || null,
      data.receiptImageUrl || null,
      new Date(), // createdAt
      new Date()  // updatedAt
    );
    // El status ya se calculó arriba, no sobreescribir si ya se proporcionó
    return entity;
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
    status?: PaymentStatus;
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
    // El status solo se actualiza si se envía explícitamente
    // No se recalcula automáticamente basado en fechas
    if (data.status !== undefined) {
      this.status = convertFrontendStatusToPrisma(data.status);
    }
    // Si no se envía status, se mantiene el status existente (no se recalcula)
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
      prismaData.status || PaymentStatus.FUTURO,
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
      status: this.status,
      pentamontSettled: this.pentamontSettled,
      notes: this.notes,
      receiptImageUrl: this.receiptImageUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toDTO(): PaymentDTO {
    return Payment.fromJSON({
      id: this.id!,
      tenantId: this.tenantId,
      propertyId: this.propertyId,
      contractId: this.contractId,
      monthNumber: this.monthNumber,
      tenantFullName: this.tenantFullName,
      tenantPhone: this.tenantPhone,
      amount: this.amount,
      // Enviar ISO completo para preservar zona horaria y evitar problemas de conversión
      paymentDate: this.paymentDate.toISOString(),
      dueDate: this.dueDate.toISOString(),
      paymentMethod: this.paymentMethod.toString(),
      status: convertPrismaStatusToFrontend(this.status),
      pentamontSettled: this.pentamontSettled,
      notes: this.notes,
      receiptImageUrl: this.receiptImageUrl || '/comprobante.png',
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    });
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


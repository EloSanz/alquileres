// TaxType enum - matches Prisma enum
export type TaxType = 'PREDIAL' | 'MUNICIPAL' | 'ALCABALA' | 'OTROS';
import { TaxDTO } from '../dtos/tax.dto';
import { Tax } from '../../../shared/types/Tax';

export class TaxEntity {
  constructor(
    public id: number | null,
    public propertyId: number | null,
    public contractId: number | null,
    public taxType: TaxType,
    public amount: number,
    public dueDate: Date,
    public paidDate: Date | null,
    public isPaid: boolean,
    public notes: string | null,
    public createdAt: Date,
    public updatedAt: Date
  ) { }

  static create(data: {
    propertyId: number | null;
    contractId?: number | null;
    taxType: string;
    amount: number;
    dueDate: string;
    paidDate?: string | null;
    isPaid?: boolean;
    notes?: string;
  }): TaxEntity {
    return new TaxEntity(
      null, // id
      data.propertyId,
      data.contractId || null,
      data.taxType as TaxType,
      data.amount,
      new Date(data.dueDate),
      data.paidDate ? new Date(data.paidDate) : null,
      data.isPaid ?? false,
      data.notes || null,
      new Date(), // createdAt
      new Date()  // updatedAt
    );
  }

  update(data: {
    propertyId?: number | null;
    contractId?: number | null;
    taxType?: string;
    amount?: number;
    dueDate?: string;
    paidDate?: string | null;
    isPaid?: boolean;
    notes?: string;
  }): TaxEntity {
    if (data.propertyId !== undefined) this.propertyId = data.propertyId;
    if (data.contractId !== undefined) this.contractId = data.contractId;
    if (data.taxType !== undefined) this.taxType = data.taxType as TaxType;
    if (data.amount !== undefined) this.amount = data.amount;
    if (data.dueDate !== undefined) this.dueDate = new Date(data.dueDate);
    if (data.paidDate !== undefined) this.paidDate = data.paidDate ? new Date(data.paidDate) : null;
    if (data.isPaid !== undefined) this.isPaid = data.isPaid;
    if (data.notes !== undefined) this.notes = data.notes;
    this.updatedAt = new Date();
    this.validate();
    return this;
  }

  static fromPrisma(prismaData: any): TaxEntity {
    return new TaxEntity(
      prismaData.id,
      prismaData.propertyId,
      prismaData.contractId,
      prismaData.taxType as TaxType,
      Number(prismaData.amount),
      prismaData.dueDate,
      prismaData.paidDate,
      prismaData.isPaid ?? false,
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
      taxType: this.taxType,
      amount: this.amount,
      dueDate: this.dueDate,
      paidDate: this.paidDate,
      isPaid: this.isPaid,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toDTO(): TaxDTO {
    return Tax.fromJSON({
      id: this.id!,
      propertyId: this.propertyId,
      contractId: this.contractId,
      taxType: this.taxType.toString(),
      amount: this.amount,
      dueDate: this.dueDate.toISOString().split('T')[0],
      paidDate: this.paidDate ? this.paidDate.toISOString().split('T')[0] : null,
      isPaid: this.isPaid,
      notes: this.notes,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    });
  }

  validate(): void {
    if (this.amount <= 0) {
      throw new Error('Tax amount must be greater than 0');
    }
    const validTypes: TaxType[] = ['PREDIAL', 'MUNICIPAL', 'ALCABALA', 'OTROS'];
    if (!validTypes.includes(this.taxType)) {
      throw new Error(`Invalid tax type: ${this.taxType}`);
    }
  }
}


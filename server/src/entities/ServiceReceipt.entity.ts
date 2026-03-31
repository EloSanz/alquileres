export type ReceiptKind = 'GENERATED' | 'UPLOADED';

export class ServiceReceiptEntity {
  constructor(
    public id: number | null,
    public categoryId: number,
    public tenantId: number | null,
    public tenantName: string | null,
    public paymentDate: Date,
    public amount: number | null,
    public receiptImageUrl: string | null,
    public receiptImagePublicId: string | null,
    public kind: ReceiptKind,
    public notes: string | null,
    public createdAt: Date,
    public updatedAt: Date,
    public categoryName?: string,
    public categoryLabel?: string,
  ) {}

  static create(data: {
    categoryId: number;
    tenantId?: number | null;
    tenantName?: string | null;
    paymentDate: string;
    amount?: number | null;
    receiptImageUrl?: string | null;
    receiptImagePublicId?: string | null;
    kind?: ReceiptKind;
    notes?: string | null;
  }): ServiceReceiptEntity {
    return new ServiceReceiptEntity(
      null,
      data.categoryId,
      data.tenantId ?? null,
      data.tenantName ?? null,
      new Date(data.paymentDate),
      data.amount ?? null,
      data.receiptImageUrl ?? null,
      data.receiptImagePublicId ?? null,
      data.kind ?? 'GENERATED',
      data.notes ?? null,
      new Date(),
      new Date(),
    );
  }

  static fromPrisma(row: any): ServiceReceiptEntity {
    return new ServiceReceiptEntity(
      row.id,
      row.categoryId,
      row.tenantId ?? null,
      row.tenantName ?? null,
      row.paymentDate,
      row.amount !== null && row.amount !== undefined ? Number(row.amount) : null,
      row.receiptImageUrl ?? null,
      row.receiptImagePublicId ?? null,
      row.kind as ReceiptKind,
      row.notes ?? null,
      row.createdAt,
      row.updatedAt,
      row.category?.name,
      row.category?.label,
    );
  }

  toDTO() {
    return {
      id: this.id!,
      categoryId: this.categoryId,
      categoryName: this.categoryName ?? null,
      categoryLabel: this.categoryLabel ?? null,
      tenantId: this.tenantId,
      tenantName: this.tenantName,
      paymentDate: this.paymentDate.toISOString().split('T')[0],
      amount: this.amount,
      receiptImageUrl: this.receiptImageUrl,
      receiptImagePublicId: this.receiptImagePublicId,
      kind: this.kind,
      notes: this.notes,
      createdAt: this.createdAt.toISOString(),
    };
  }
}

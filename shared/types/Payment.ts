export class Payment {
  constructor(
    public id: number,
    public tenantId: number | null,
    public propertyId: number | null,
    public contractId: number | null,
    public monthNumber: number | null,
    public tenantFullName: string | null,
    public tenantPhone: string | null,
    public amount: number,
    public paymentDate: string,
    public dueDate: string,
    public paymentMethod: string,
    public pentamontSettled: boolean,
    public notes: string | null,
    public receiptImageUrl: string | null,
    public createdAt: string,
    public updatedAt: string
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (this.amount <= 0) errors.push('Amount must be greater than 0');
    if (!this.paymentDate) errors.push('Payment date is required');
    if (!this.dueDate) errors.push('Due date is required');
    if (!this.paymentMethod) errors.push('Payment method is required');
    return errors;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data: any): Payment {
    return new Payment(
      data.id,
      data.tenantId,
      data.propertyId,
      data.contractId,
      data.monthNumber,
      data.tenantFullName,
      data.tenantPhone,
      data.amount,
      data.paymentDate,
      data.dueDate,
      data.paymentMethod,
      data.pentamontSettled,
      data.notes,
      data.receiptImageUrl,
      data.createdAt,
      data.updatedAt
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

export class CreatePayment {
  constructor(
    public tenantId: number,
    public propertyId: number | null,
    public amount: number,
    public dueDate: string,
    public paymentDate?: string,
    public paymentMethod?: string,
    public pentamontSettled?: boolean,
    public notes?: string
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (!this.tenantId || this.tenantId <= 0) errors.push('Tenant ID is required');
    if (this.amount <= 0) errors.push('Amount must be greater than 0');
    if (!this.dueDate) errors.push('Due date is required');
    return errors;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data: any): CreatePayment {
    return new CreatePayment(
      data.tenantId,
      data.propertyId,
      data.amount,
      data.dueDate,
      data.paymentDate,
      data.paymentMethod,
      data.pentamontSettled,
      data.notes
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

export class UpdatePayment {
  constructor(
    public tenantId?: number | null,
    public propertyId?: number | null,
    public contractId?: number | null,
    public monthNumber?: number | null,
    public tenantFullName?: string | null,
    public tenantPhone?: string | null,
    public amount?: number,
    public paymentDate?: string,
    public dueDate?: string,
    public paymentMethod?: string,
    public pentamontSettled?: boolean,
    public notes?: string
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (this.amount !== undefined && this.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }
    return errors;
  }

  toJSON() {
    const result: any = {};
    if (this.tenantId !== undefined) result.tenantId = this.tenantId;
    if (this.propertyId !== undefined) result.propertyId = this.propertyId;
    if (this.contractId !== undefined) result.contractId = this.contractId;
    if (this.monthNumber !== undefined) result.monthNumber = this.monthNumber;
    if (this.tenantFullName !== undefined) result.tenantFullName = this.tenantFullName;
    if (this.tenantPhone !== undefined) result.tenantPhone = this.tenantPhone;
    if (this.amount !== undefined) result.amount = this.amount;
    if (this.paymentDate !== undefined) result.paymentDate = this.paymentDate;
    if (this.dueDate !== undefined) result.dueDate = this.dueDate;
    if (this.paymentMethod !== undefined) result.paymentMethod = this.paymentMethod;
    if (this.pentamontSettled !== undefined) result.pentamontSettled = this.pentamontSettled;
    if (this.notes !== undefined) result.notes = this.notes;
    return result;
  }

  static fromJSON(data: any): UpdatePayment {
    return new UpdatePayment(
      data.tenantId,
      data.propertyId,
      data.contractId,
      data.monthNumber,
      data.tenantFullName,
      data.tenantPhone,
      data.amount,
      data.paymentDate,
      data.dueDate,
      data.paymentMethod,
      data.pentamontSettled,
      data.notes
    );
  }

  toDTO() {
    return this.toJSON();
  }
}


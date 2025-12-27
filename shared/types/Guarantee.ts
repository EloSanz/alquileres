export class Guarantee {
  constructor(
    public id: number,
    public propertyId: number | null,
    public contractId: number | null,
    public tenantId: number | null,
    public guaranteeType: string,
    public amount: number,
    public depositDate: string,
    public returnDate: string | null,
    public isReturned: boolean,
    public notes: string | null,
    public createdAt: string,
    public updatedAt: string
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (this.amount <= 0) errors.push('Amount must be greater than 0');
    if (!this.depositDate) errors.push('Deposit date is required');
    if (!this.guaranteeType) errors.push('Guarantee type is required');
    return errors;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data: any): Guarantee {
    return new Guarantee(
      data.id,
      data.propertyId,
      data.contractId,
      data.tenantId,
      data.guaranteeType,
      data.amount,
      data.depositDate,
      data.returnDate,
      data.isReturned,
      data.notes,
      data.createdAt,
      data.updatedAt
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

export class CreateGuarantee {
  constructor(
    public propertyId: number | null,
    public contractId: number | null,
    public tenantId: number | null,
    public guaranteeType: string,
    public amount: number,
    public depositDate?: string,
    public returnDate?: string | null,
    public isReturned?: boolean,
    public notes?: string
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (this.amount <= 0) errors.push('Amount must be greater than 0');
    if (!this.guaranteeType) errors.push('Guarantee type is required');
    return errors;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data: any): CreateGuarantee {
    return new CreateGuarantee(
      data.propertyId,
      data.contractId,
      data.tenantId,
      data.guaranteeType,
      data.amount,
      data.depositDate,
      data.returnDate,
      data.isReturned,
      data.notes
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

export class UpdateGuarantee {
  constructor(
    public propertyId?: number | null,
    public contractId?: number | null,
    public tenantId?: number | null,
    public guaranteeType?: string,
    public amount?: number,
    public depositDate?: string,
    public returnDate?: string | null,
    public isReturned?: boolean,
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
    if (this.propertyId !== undefined) result.propertyId = this.propertyId;
    if (this.contractId !== undefined) result.contractId = this.contractId;
    if (this.tenantId !== undefined) result.tenantId = this.tenantId;
    if (this.guaranteeType !== undefined) result.guaranteeType = this.guaranteeType;
    if (this.amount !== undefined) result.amount = this.amount;
    if (this.depositDate !== undefined) result.depositDate = this.depositDate;
    if (this.returnDate !== undefined) result.returnDate = this.returnDate;
    if (this.isReturned !== undefined) result.isReturned = this.isReturned;
    if (this.notes !== undefined) result.notes = this.notes;
    return result;
  }

  static fromJSON(data: any): UpdateGuarantee {
    return new UpdateGuarantee(
      data.propertyId,
      data.contractId,
      data.tenantId,
      data.guaranteeType,
      data.amount,
      data.depositDate,
      data.returnDate,
      data.isReturned,
      data.notes
    );
  }

  toDTO() {
    return this.toJSON();
  }
}


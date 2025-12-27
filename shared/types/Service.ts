export class Service {
  constructor(
    public id: number,
    public propertyId: number | null,
    public contractId: number | null,
    public serviceType: string,
    public amount: number,
    public dueDate: string,
    public paidDate: string | null,
    public isPaid: boolean,
    public notes: string | null,
    public createdAt: string,
    public updatedAt: string
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (this.amount <= 0) errors.push('Amount must be greater than 0');
    if (!this.dueDate) errors.push('Due date is required');
    if (!this.serviceType) errors.push('Service type is required');
    return errors;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data: any): Service {
    return new Service(
      data.id,
      data.propertyId,
      data.contractId,
      data.serviceType,
      data.amount,
      data.dueDate,
      data.paidDate,
      data.isPaid,
      data.notes,
      data.createdAt,
      data.updatedAt
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

export class CreateService {
  constructor(
    public propertyId: number | null,
    public contractId: number | null,
    public serviceType: string,
    public amount: number,
    public dueDate: string,
    public paidDate?: string | null,
    public isPaid?: boolean,
    public notes?: string
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (this.amount <= 0) errors.push('Amount must be greater than 0');
    if (!this.dueDate) errors.push('Due date is required');
    if (!this.serviceType) errors.push('Service type is required');
    return errors;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data: any): CreateService {
    return new CreateService(
      data.propertyId,
      data.contractId,
      data.serviceType,
      data.amount,
      data.dueDate,
      data.paidDate,
      data.isPaid,
      data.notes
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

export class UpdateService {
  constructor(
    public propertyId?: number | null,
    public contractId?: number | null,
    public serviceType?: string,
    public amount?: number,
    public dueDate?: string,
    public paidDate?: string | null,
    public isPaid?: boolean,
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
    if (this.serviceType !== undefined) result.serviceType = this.serviceType;
    if (this.amount !== undefined) result.amount = this.amount;
    if (this.dueDate !== undefined) result.dueDate = this.dueDate;
    if (this.paidDate !== undefined) result.paidDate = this.paidDate;
    if (this.isPaid !== undefined) result.isPaid = this.isPaid;
    if (this.notes !== undefined) result.notes = this.notes;
    return result;
  }

  static fromJSON(data: any): UpdateService {
    return new UpdateService(
      data.propertyId,
      data.contractId,
      data.serviceType,
      data.amount,
      data.dueDate,
      data.paidDate,
      data.isPaid,
      data.notes
    );
  }

  toDTO() {
    return this.toJSON();
  }
}


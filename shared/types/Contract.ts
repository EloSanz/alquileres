export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  TERMINATED = 'TERMINATED',
}

export class Contract {
  constructor(
    public id: number,
    public tenantId: number | null,
    public propertyId: number | null,
    public tenantFullName: string | null,
    public propertyName: string | null,
    public propertyLocalNumber: number | null,
    public startDate: string,
    public endDate: string,
    public monthlyRent: number,
    public status: ContractStatus | string,
    public createdAt: string,
    public updatedAt: string
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (this.monthlyRent <= 0) errors.push('Monthly rent must be greater than 0');
    if (!this.startDate) errors.push('Start date is required');
    if (!this.endDate) errors.push('End date is required');
    return errors;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data: any): Contract {
    return new Contract(
      data.id,
      data.tenantId,
      data.propertyId,
      data.tenantFullName,
      data.propertyName,
      data.propertyLocalNumber,
      data.startDate,
      data.endDate,
      data.monthlyRent,
      data.status,
      data.createdAt,
      data.updatedAt
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

export class CreateContract {
  constructor(
    public tenantId: number,
    public propertyId: number,
    public startDate: string,
    public monthlyRent: number
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (!this.tenantId || this.tenantId <= 0) errors.push('Tenant ID is required');
    if (!this.propertyId || this.propertyId <= 0) errors.push('Property ID is required');
    if (!this.startDate) errors.push('Start date is required');
    if (this.monthlyRent <= 0) errors.push('Monthly rent must be greater than 0');
    return errors;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data: any): CreateContract {
    return new CreateContract(
      data.tenantId,
      data.propertyId,
      data.startDate,
      data.monthlyRent
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

export class UpdateContract {
  constructor(
    public tenantId?: number | null,
    public propertyId?: number | null,
    public startDate?: string,
    public monthlyRent?: number,
    public status?: ContractStatus | string
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (this.monthlyRent !== undefined && this.monthlyRent <= 0) {
      errors.push('Monthly rent must be greater than 0');
    }
    return errors;
  }

  toJSON() {
    const result: any = {};
    if (this.tenantId !== undefined) result.tenantId = this.tenantId;
    if (this.propertyId !== undefined) result.propertyId = this.propertyId;
    if (this.startDate !== undefined) result.startDate = this.startDate;
    if (this.monthlyRent !== undefined) result.monthlyRent = this.monthlyRent;
    if (this.status !== undefined) result.status = this.status;
    return result;
  }

  static fromJSON(data: any): UpdateContract {
    return new UpdateContract(
      data.tenantId,
      data.propertyId,
      data.startDate,
      data.monthlyRent,
      data.status
    );
  }

  toDTO() {
    return this.toJSON();
  }
}


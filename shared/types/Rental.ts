export class Rental {
  constructor(
    public id: number,
    public tenantId: number,
    public propertyId: number,
    public startDate: string,
    public endDate: string | null,
    public monthlyRent: number,
    public depositAmount: number | null,
    public status: string,
    public notes: string | null,
    public createdAt: string,
    public updatedAt: string,
    public tenant?: { id: number; firstName: string; lastName: string; email: string },
    public property?: { id: number; ubicacion: string; localNumber: number }
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (this.monthlyRent <= 0) errors.push('Monthly rent must be greater than 0');
    if (!this.startDate) errors.push('Start date is required');
    return errors;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data: any): Rental {
    return new Rental(
      data.id,
      data.tenantId,
      data.propertyId,
      data.startDate,
      data.endDate,
      data.monthlyRent,
      data.depositAmount,
      data.status,
      data.notes,
      data.createdAt,
      data.updatedAt,
      data.tenant,
      data.property
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

export class CreateRental {
  constructor(
    public tenantId: number,
    public propertyId: number,
    public startDate: string,
    public monthlyRent: number,
    public endDate?: string,
    public depositAmount?: number,
    public status?: string,
    public notes?: string
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

  static fromJSON(data: any): CreateRental {
    return new CreateRental(
      data.tenantId,
      data.propertyId,
      data.startDate,
      data.monthlyRent,
      data.endDate,
      data.depositAmount,
      data.status,
      data.notes
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

export class UpdateRental {
  constructor(
    public tenantId?: number,
    public propertyId?: number,
    public startDate?: string,
    public endDate?: string,
    public monthlyRent?: number,
    public depositAmount?: number,
    public status?: string,
    public notes?: string
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
    if (this.endDate !== undefined) result.endDate = this.endDate;
    if (this.monthlyRent !== undefined) result.monthlyRent = this.monthlyRent;
    if (this.depositAmount !== undefined) result.depositAmount = this.depositAmount;
    if (this.status !== undefined) result.status = this.status;
    if (this.notes !== undefined) result.notes = this.notes;
    return result;
  }

  static fromJSON(data: any): UpdateRental {
    return new UpdateRental(
      data.tenantId,
      data.propertyId,
      data.startDate,
      data.endDate,
      data.monthlyRent,
      data.depositAmount,
      data.status,
      data.notes
    );
  }

  toDTO() {
    return this.toJSON();
  }
}


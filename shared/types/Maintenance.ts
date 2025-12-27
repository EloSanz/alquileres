export class Maintenance {
  constructor(
    public id: number,
    public propertyId: number | null,
    public contractId: number | null,
    public maintenanceType: string,
    public description: string,
    public estimatedCost: number | null,
    public actualCost: number | null,
    public scheduledDate: string | null,
    public completedDate: string | null,
    public status: string,
    public notes: string | null,
    public createdAt: string,
    public updatedAt: string
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (!this.description || this.description.trim().length === 0) errors.push('Description is required');
    if (this.estimatedCost !== null && this.estimatedCost < 0) errors.push('Estimated cost cannot be negative');
    if (this.actualCost !== null && this.actualCost < 0) errors.push('Actual cost cannot be negative');
    return errors;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data: any): Maintenance {
    return new Maintenance(
      data.id,
      data.propertyId,
      data.contractId,
      data.maintenanceType,
      data.description,
      data.estimatedCost,
      data.actualCost,
      data.scheduledDate,
      data.completedDate,
      data.status,
      data.notes,
      data.createdAt,
      data.updatedAt
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

export class CreateMaintenance {
  constructor(
    public propertyId: number | null,
    public contractId: number | null,
    public maintenanceType: string,
    public description: string,
    public estimatedCost?: number | null,
    public actualCost?: number | null,
    public scheduledDate?: string | null,
    public completedDate?: string | null,
    public status?: string,
    public notes?: string
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (!this.description || this.description.trim().length === 0) errors.push('Description is required');
    if (!this.maintenanceType) errors.push('Maintenance type is required');
    if (this.estimatedCost !== undefined && this.estimatedCost !== null && this.estimatedCost < 0) {
      errors.push('Estimated cost cannot be negative');
    }
    if (this.actualCost !== undefined && this.actualCost !== null && this.actualCost < 0) {
      errors.push('Actual cost cannot be negative');
    }
    return errors;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data: any): CreateMaintenance {
    return new CreateMaintenance(
      data.propertyId,
      data.contractId,
      data.maintenanceType,
      data.description,
      data.estimatedCost,
      data.actualCost,
      data.scheduledDate,
      data.completedDate,
      data.status,
      data.notes
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

export class UpdateMaintenance {
  constructor(
    public propertyId?: number | null,
    public contractId?: number | null,
    public maintenanceType?: string,
    public description?: string,
    public estimatedCost?: number | null,
    public actualCost?: number | null,
    public scheduledDate?: string | null,
    public completedDate?: string | null,
    public status?: string,
    public notes?: string
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (this.estimatedCost !== undefined && this.estimatedCost !== null && this.estimatedCost < 0) {
      errors.push('Estimated cost cannot be negative');
    }
    if (this.actualCost !== undefined && this.actualCost !== null && this.actualCost < 0) {
      errors.push('Actual cost cannot be negative');
    }
    return errors;
  }

  toJSON() {
    const result: any = {};
    if (this.propertyId !== undefined) result.propertyId = this.propertyId;
    if (this.contractId !== undefined) result.contractId = this.contractId;
    if (this.maintenanceType !== undefined) result.maintenanceType = this.maintenanceType;
    if (this.description !== undefined) result.description = this.description;
    if (this.estimatedCost !== undefined) result.estimatedCost = this.estimatedCost;
    if (this.actualCost !== undefined) result.actualCost = this.actualCost;
    if (this.scheduledDate !== undefined) result.scheduledDate = this.scheduledDate;
    if (this.completedDate !== undefined) result.completedDate = this.completedDate;
    if (this.status !== undefined) result.status = this.status;
    if (this.notes !== undefined) result.notes = this.notes;
    return result;
  }

  static fromJSON(data: any): UpdateMaintenance {
    return new UpdateMaintenance(
      data.propertyId,
      data.contractId,
      data.maintenanceType,
      data.description,
      data.estimatedCost,
      data.actualCost,
      data.scheduledDate,
      data.completedDate,
      data.status,
      data.notes
    );
  }

  toDTO() {
    return this.toJSON();
  }
}


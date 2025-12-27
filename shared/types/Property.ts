export class Property {
  constructor(
    public id: number,
    public localNumber: number,
    public ubicacion: 'BOULEVAR' | 'SAN_MARTIN' | 'PATIO',
    public monthlyRent: number,
    public status: string,
    public tenantId: number | null,
    public createdAt: string,
    public updatedAt: string,
    public tenant?: { id: number; firstName: string; lastName: string; email: string }
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (this.localNumber <= 0) errors.push('Local number must be greater than 0');
    if (this.monthlyRent <= 0) errors.push('Monthly rent must be greater than 0');
    if (!this.ubicacion) errors.push('Ubicacion is required');
    return errors;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data: any): Property {
    return new Property(
      data.id,
      data.localNumber,
      data.ubicacion,
      data.monthlyRent,
      data.status,
      data.tenantId,
      data.createdAt,
      data.updatedAt,
      data.tenant
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

export class CreateProperty {
  constructor(
    public localNumber: number,
    public ubicacion: 'BOULEVAR' | 'SAN_MARTIN' | 'PATIO',
    public monthlyRent: number,
    public tenantId: number | null
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (this.localNumber <= 0) errors.push('Local number must be greater than 0');
    if (!this.ubicacion) errors.push('Ubicacion is required');
    if (this.monthlyRent <= 0) errors.push('Monthly rent must be greater than 0');
    return errors;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data: any): CreateProperty {
    return new CreateProperty(
      data.localNumber,
      data.ubicacion,
      data.monthlyRent,
      data.tenantId ?? null
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

export class UpdateProperty {
  constructor(
    public localNumber?: number,
    public ubicacion?: 'BOULEVAR' | 'SAN_MARTIN' | 'PATIO',
    public monthlyRent?: number
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (this.localNumber !== undefined && this.localNumber <= 0) {
      errors.push('Local number must be greater than 0');
    }
    if (this.monthlyRent !== undefined && this.monthlyRent <= 0) {
      errors.push('Monthly rent must be greater than 0');
    }
    return errors;
  }

  toJSON() {
    const result: any = {};
    if (this.localNumber !== undefined) result.localNumber = this.localNumber;
    if (this.ubicacion !== undefined) result.ubicacion = this.ubicacion;
    if (this.monthlyRent !== undefined) result.monthlyRent = this.monthlyRent;
    return result;
  }

  static fromJSON(data: any): UpdateProperty {
    return new UpdateProperty(
      data.localNumber,
      data.ubicacion,
      data.monthlyRent
    );
  }

  toDTO() {
    return this.toJSON();
  }
}


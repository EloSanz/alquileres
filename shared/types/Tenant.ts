export class Tenant {
  constructor(
    public id: number,
    public firstName: string,
    public lastName: string,
    public phone: string | null,
    public documentId: string,
    public numeroLocal: string | null,
    public rubro: string | null,
    public fechaInicioContrato: string | null,
    public estadoPago: string,
    public createdAt: string,
    public updatedAt: string,
    public localNumbers?: number[] // Números de locales asociados al tenant
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (!this.firstName || this.firstName.length < 2) errors.push('First name must be at least 2 characters');
    if (!this.lastName || this.lastName.length < 2) errors.push('Last name must be at least 2 characters');
    if (!this.documentId || this.documentId.length < 5) errors.push('Document ID must be at least 5 characters');
    return errors;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data: any): Tenant {
    return new Tenant(
      data.id,
      data.firstName,
      data.lastName,
      data.phone,
      data.documentId,
      data.numeroLocal,
      data.rubro,
      data.fechaInicioContrato,
      data.estadoPago,
      data.createdAt,
      data.updatedAt,
      data.localNumbers
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

export class CreateTenant {
  constructor(
    public firstName: string,
    public lastName: string,
    public documentId: string,
    public phone?: string,
    public numeroLocal?: string,
    public rubro?: string,
    public fechaInicioContrato?: string
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (!this.firstName || this.firstName.length < 2) errors.push('First name must be at least 2 characters');
    if (!this.lastName || this.lastName.length < 2) errors.push('Last name must be at least 2 characters');
    if (!this.documentId || this.documentId.length < 5) errors.push('Document ID must be at least 5 characters');
    return errors;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data: any): CreateTenant {
    return new CreateTenant(
      data.firstName,
      data.lastName,
      data.documentId,
      data.phone,
      data.numeroLocal,
      data.rubro,
      data.fechaInicioContrato
    );
  }

  toDTO() {
    return this.toJSON();
  }
}

export class UpdateTenant {
  constructor(
    public firstName?: string,
    public lastName?: string,
    public phone?: string,
    public documentId?: string,
    public numeroLocal?: string,
    public rubro?: string,
    public fechaInicioContrato?: string,
    public estadoPago?: string
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (this.firstName !== undefined && this.firstName.length < 2) {
      errors.push('First name must be at least 2 characters');
    }
    if (this.lastName !== undefined && this.lastName.length < 2) {
      errors.push('Last name must be at least 2 characters');
    }
    if (this.documentId !== undefined && this.documentId.length < 5) {
      errors.push('Document ID must be at least 5 characters');
    }
    return errors;
  }

  toJSON() {
    const result: any = {};
    if (this.firstName !== undefined) result.firstName = this.firstName;
    if (this.lastName !== undefined) result.lastName = this.lastName;
    if (this.phone !== undefined) result.phone = this.phone;
    if (this.documentId !== undefined) result.documentId = this.documentId;
    if (this.numeroLocal !== undefined) result.numeroLocal = this.numeroLocal;
    if (this.rubro !== undefined) result.rubro = this.rubro;
    if (this.fechaInicioContrato !== undefined) result.fechaInicioContrato = this.fechaInicioContrato;
    if (this.estadoPago !== undefined) result.estadoPago = this.estadoPago;
    return result;
  }

  static fromJSON(data: any): UpdateTenant {
    return new UpdateTenant(
      data.firstName,
      data.lastName,
      data.phone,
      data.documentId,
      data.numeroLocal,
      data.rubro,
      data.fechaInicioContrato,
      data.estadoPago
    );
  }

  toDTO() {
    return this.toJSON();
  }
}


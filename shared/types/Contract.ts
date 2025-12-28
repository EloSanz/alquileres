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
    public startDate: Date | string,
    public endDate: Date | string,
    public monthlyRent: number,
    public status: ContractStatus | string,
    public createdAt: string,
    public updatedAt: string
  ) {}

  validate(): string[] {
    const errors: string[] = [];
    if (this.monthlyRent <= 0) errors.push('Monthly rent must be greater than 0');
    if (!this.startDate || (this.startDate instanceof Date && isNaN(this.startDate.getTime()))) {
      errors.push('Start date is required');
    }
    if (!this.endDate || (this.endDate instanceof Date && isNaN(this.endDate.getTime()))) {
      errors.push('End date is required');
    }
    return errors;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data: any): Contract {
    // Convertir fechas a Date objects si vienen como strings
    // Parsear como fecha local para evitar problemas de zona horaria
    const parseDate = (dateStr: string | Date | null | undefined): Date => {
      if (dateStr instanceof Date) return dateStr;
      if (!dateStr) return new Date();
      
      const str = String(dateStr);
      // Si viene como ISO string completo (con T y Z), extraer solo la parte de fecha
      const dateOnlyMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (dateOnlyMatch) {
        const [, year, month, day] = dateOnlyMatch;
        // Parsear como fecha local (no UTC) para evitar desfases de zona horaria
        return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      }
      // Fallback: parsear normalmente
      return new Date(str);
    };
    
    const startDate = parseDate(data.startDate);
    const endDate = parseDate(data.endDate);
    
    return new Contract(
      data.id,
      data.tenantId,
      data.propertyId,
      data.tenantFullName,
      data.propertyName,
      data.propertyLocalNumber,
      startDate,
      endDate,
      data.monthlyRent,
      data.status,
      data.createdAt instanceof Date ? data.createdAt.toISOString() : String(data.createdAt || ''),
      data.updatedAt instanceof Date ? data.updatedAt.toISOString() : String(data.updatedAt || '')
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
    public monthlyRent: number,
    public endDate?: string
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
      data.monthlyRent,
      data.endDate
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


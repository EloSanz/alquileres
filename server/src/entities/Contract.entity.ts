export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  TERMINATED = 'TERMINATED',
}

export interface ContractDTO {
  id: number;
  tenantId: number | null;
  propertyId: number | null;
  tenantFullName?: string | null;
  propertyName?: string;
  propertyLocalNumber?: number;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractDTO {
  tenantId: number;
  propertyId: number;
  startDate: string;
  monthlyRent: number;
}

export interface UpdateContractDTO {
  tenantId?: number | null;
  propertyId?: number | null;
  startDate?: string;
  monthlyRent?: number;
  status?: ContractStatus;
}

export class ContractEntity {
  constructor(
    public id: number | null,
    public tenantId: number | null,
    public propertyId: number | null,
    // Redundancia para trazabilidad
    public tenantFullName: string | null,
    public startDate: Date,
    public endDate: Date,
    public monthlyRent: number,
    public status: ContractStatus,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(data: CreateContractDTO): ContractEntity {
    const startDate = new Date(data.startDate);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1); // Contrato de 1 año

    const entity = new ContractEntity(
      null, // id
      data.tenantId,
      data.propertyId,
      null,
      startDate,
      endDate,
      data.monthlyRent,
      ContractStatus.ACTIVE,
      new Date(), // createdAt
      new Date()  // updatedAt
    );
    return entity;
  }

  update(data: UpdateContractDTO): ContractEntity {
    if (data.tenantId !== undefined) this.tenantId = data.tenantId;
    if (data.propertyId !== undefined) this.propertyId = data.propertyId;
    if (data.startDate !== undefined) {
      this.startDate = new Date(data.startDate);
      // Recalcular endDate si cambia startDate
      this.endDate = new Date(this.startDate);
      this.endDate.setFullYear(this.endDate.getFullYear() + 1);
    }
    if (data.monthlyRent !== undefined) this.monthlyRent = data.monthlyRent;
    if (data.status !== undefined) this.status = data.status;
    this.updatedAt = new Date();
    this.validate();
    return this;
  }

  static fromPrisma(prismaData: any): ContractEntity {
    const entity = new ContractEntity(
      prismaData.id,
      prismaData.tenantId,
      prismaData.propertyId,
      prismaData.tenantFullName ?? null,
      prismaData.startDate,
      prismaData.endDate,
      Number(prismaData.monthlyRent),
      prismaData.status as ContractStatus,
      prismaData.createdAt,
      prismaData.updatedAt
    );
    // Agregar datos de relaciones si están disponibles
    if (prismaData.tenant) {
      entity.tenantFullName = entity.tenantFullName ?? `${prismaData.tenant.firstName} ${prismaData.tenant.lastName}`;
    }
    if (prismaData.property) {
      (entity as any).propertyName = prismaData.property.name;
      (entity as any).propertyLocalNumber = prismaData.property.localNumber;
    }
    return entity;
  }

  toPrisma() {
    return {
      id: this.id || undefined,
      tenantId: this.tenantId,
      propertyId: this.propertyId,
      tenantFullName: this.tenantFullName ?? undefined,
      startDate: this.startDate,
      endDate: this.endDate,
      monthlyRent: this.monthlyRent,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toDTO(): ContractDTO {
    return {
      id: this.id!,
      tenantId: this.tenantId,
      propertyId: this.propertyId,
      tenantFullName: this.tenantFullName,
      propertyName: (this as any).propertyName,
      propertyLocalNumber: (this as any).propertyLocalNumber,
      startDate: this.startDate.toISOString().split('T')[0],
      endDate: this.endDate.toISOString().split('T')[0],
      monthlyRent: this.monthlyRent,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  validate(): void {
    // Validar tenantId y propertyId solo si no son null (para contratos activos)
    if (this.tenantId === null) {
      throw new Error('Contract must have a tenant');
    }
    if (this.propertyId === null) {
      throw new Error('Contract must have a property');
    }
    if (this.monthlyRent <= 0) {
      throw new Error('Monthly rent must be greater than 0');
    }
    if (this.startDate >= this.endDate) {
      throw new Error('Start date must be before end date');
    }
    const oneYearFromStart = new Date(this.startDate);
    oneYearFromStart.setFullYear(oneYearFromStart.getFullYear() + 1);
    const daysDifference = Math.abs(this.endDate.getTime() - oneYearFromStart.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDifference > 1) {
      throw new Error('Contract must be exactly 1 year long');
    }
  }
}


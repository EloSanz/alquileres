// ServiceType enum - matches Prisma enum
export type ServiceType = 'AGUA' | 'LUZ' | 'ARBITRIOS';

export class ServiceEntity {
  constructor(
    public id: number | null,
    public propertyId: number | null,
    public contractId: number | null,
    public serviceType: ServiceType,
    public amount: number,
    public dueDate: Date,
    public paidDate: Date | null,
    public isPaid: boolean,
    public notes: string | null,
    public createdAt: Date,
    public updatedAt: Date
  ) { }

  static create(data: {
    propertyId: number | null;
    contractId?: number | null;
    serviceType: string;
    amount: number;
    dueDate: string;
    paidDate?: string | null;
    isPaid?: boolean;
    notes?: string;
  }): ServiceEntity {
    return new ServiceEntity(
      null, // id
      data.propertyId,
      data.contractId || null,
      data.serviceType as ServiceType,
      data.amount,
      new Date(data.dueDate),
      data.paidDate ? new Date(data.paidDate) : null,
      data.isPaid ?? false,
      data.notes || null,
      new Date(), // createdAt
      new Date()  // updatedAt
    );
  }

  update(data: {
    propertyId?: number | null;
    contractId?: number | null;
    serviceType?: string;
    amount?: number;
    dueDate?: string;
    paidDate?: string | null;
    isPaid?: boolean;
    notes?: string;
  }): ServiceEntity {
    if (data.propertyId !== undefined) this.propertyId = data.propertyId;
    if (data.contractId !== undefined) this.contractId = data.contractId;
    if (data.serviceType !== undefined) this.serviceType = data.serviceType as ServiceType;
    if (data.amount !== undefined) this.amount = data.amount;
    if (data.dueDate !== undefined) this.dueDate = new Date(data.dueDate);
    if (data.paidDate !== undefined) this.paidDate = data.paidDate ? new Date(data.paidDate) : null;
    if (data.isPaid !== undefined) this.isPaid = data.isPaid;
    if (data.notes !== undefined) this.notes = data.notes;
    this.updatedAt = new Date();
    this.validate();
    return this;
  }

  static fromPrisma(prismaData: any): ServiceEntity {
    return new ServiceEntity(
      prismaData.id,
      prismaData.propertyId,
      prismaData.contractId,
      prismaData.serviceType as ServiceType,
      Number(prismaData.amount),
      prismaData.dueDate,
      prismaData.paidDate,
      prismaData.isPaid ?? false,
      prismaData.notes,
      prismaData.createdAt,
      prismaData.updatedAt
    );
  }

  toPrisma() {
    return {
      id: this.id || undefined,
      propertyId: this.propertyId,
      contractId: this.contractId,
      serviceType: this.serviceType,
      amount: this.amount,
      dueDate: this.dueDate,
      paidDate: this.paidDate,
      isPaid: this.isPaid,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toDTO(): ServiceDTO {
    return {
      id: this.id!,
      propertyId: this.propertyId,
      contractId: this.contractId,
      serviceType: this.serviceType,
      amount: this.amount,
      dueDate: this.dueDate.toISOString().split('T')[0],
      paidDate: this.paidDate ? this.paidDate.toISOString().split('T')[0] : null,
      isPaid: this.isPaid,
      notes: this.notes,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  validate(): void {
    if (this.amount <= 0) {
      throw new Error('Service amount must be greater than 0');
    }
    const validTypes: ServiceType[] = ['AGUA', 'LUZ', 'ARBITRIOS'];
    if (!validTypes.includes(this.serviceType)) {
      throw new Error(`Invalid service type: ${this.serviceType}`);
    }
  }
}

// DTO types
export interface ServiceDTO {
  id: number;
  propertyId: number | null;
  contractId: number | null;
  serviceType: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  isPaid: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDTO {
  propertyId: number | null;
  contractId: number | null;
  serviceType: string;
  amount: number;
  dueDate: string;
  paidDate?: string | null;
  isPaid?: boolean;
  notes?: string;
}

export interface UpdateServiceDTO {
  propertyId?: number | null;
  contractId?: number | null;
  serviceType?: string;
  amount?: number;
  dueDate?: string;
  paidDate?: string | null;
  isPaid?: boolean;
  notes?: string;
}


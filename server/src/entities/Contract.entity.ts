import { ContractDTO, ContractStatus } from '../dtos/contract.dto';
import { Contract } from '../../../shared/types/Contract';

export { ContractStatus };

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

  static create(data: { tenantId: number; propertyId: number; startDate: string; monthlyRent: number; endDate?: string }): ContractEntity {
    const startDate = new Date(data.startDate);
    // Si se proporciona endDate, usarlo; si no, calcularlo automáticamente (1 año después)
    const endDate = data.endDate ? new Date(data.endDate) : (() => {
      const calculated = new Date(startDate);
      calculated.setFullYear(calculated.getFullYear() + 1);
      return calculated;
    })();

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

  update(data: { tenantId?: number | null; propertyId?: number | null; startDate?: string; monthlyRent?: number; status?: ContractStatus }): ContractEntity {
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
    // Formatear fechas como YYYY-MM-DD para evitar problemas de zona horaria
    // Usar métodos UTC para obtener los valores correctos independientemente de la zona horaria
    const formatDateOnly = (date: Date): string => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return Contract.fromJSON({
      id: this.id!,
      tenantId: this.tenantId,
      propertyId: this.propertyId,
      tenantFullName: this.tenantFullName,
      propertyName: (this as any).propertyName,
      propertyLocalNumber: (this as any).propertyLocalNumber,
      startDate: formatDateOnly(this.startDate), // Enviar solo fecha sin hora
      endDate: formatDateOnly(this.endDate), // Enviar solo fecha sin hora
      monthlyRent: this.monthlyRent,
      status: this.status.toString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    });
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
    // Validar que el contrato tenga al menos 1 día de duración
    // Ya no requerimos que sea exactamente 1 año, solo que sea válido
  }
}


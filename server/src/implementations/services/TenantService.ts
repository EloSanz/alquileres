import { ITenantService } from '../../interfaces/services/ITenantService';
import { ITenantRepository } from '../../interfaces/repositories/ITenantRepository';
import { IPaymentRepository } from '../../interfaces/repositories/IPaymentRepository';
import { IPropertyRepository } from '../../interfaces/repositories/IPropertyRepository';
import { TenantDTO, CreateTenantDTO, UpdateTenantDTO } from '../../dtos/tenant.dto';
import { TenantEntity } from '../../entities/Tenant.entity';
import { EstadoPago, Rubro, PaymentStatus } from '@prisma/client';
import { NotFoundError, ConflictError, BadRequestError } from '../../exceptions';

// Helper function to convert string to Rubro enum
function stringToRubro(value: string | null): Rubro | null {
  if (!value) return null;
  switch (value.toUpperCase()) {
    case 'TIPEO': return Rubro.TIPEO;
    case 'PEDICURE': return Rubro.PEDICURE;
    default: return null;
  }
}

// Helper function to convert string to EstadoPago enum
function stringToEstadoPago(value: string | null): EstadoPago | null {
  if (!value) return null;
  switch (value.toUpperCase()) {
    case 'AL_DIA': return EstadoPago.AL_DIA;
    case 'CON_DEUDA': return EstadoPago.CON_DEUDA;
    default: return null;
  }
}

export class TenantService implements ITenantService {
  constructor(
    private tenantRepository: ITenantRepository,
    private paymentRepository: IPaymentRepository,
    private propertyRepository: IPropertyRepository
  ) { }

  /**
   * Calcula el estado de pago de un inquilino basado en los pagos del año actual
   * Si hay algún pago del año actual que no está PAGADO, el inquilino tiene CON_DEUDA
   * Si todos los pagos del año actual están PAGADO, el inquilino está AL_DIA
   */
  private async calculatePaymentStatus(tenantId: number, fechaInicioContrato: Date | null, year?: number, preloadedPayments?: any[]): Promise<EstadoPago> {
    if (!fechaInicioContrato) {
      return EstadoPago.AL_DIA; // Si no hay fecha de inicio, asumimos al día
    }

    const currentYear = year || new Date().getFullYear();
    const contractStart = new Date(fechaInicioContrato);

    // Si el contrato empieza en el futuro (después del año consultado), está al día
    if (contractStart.getFullYear() > currentYear) {
      return EstadoPago.AL_DIA;
    }

    // Obtener todos los pagos del inquilino
    const payments = preloadedPayments || await this.paymentRepository.findByTenantId(tenantId);

    // Filtrar pagos del año actual usando dueDate
    const currentYearPayments = payments.filter((payment: any) => {
      const dueDate = new Date(payment.dueDate);
      return dueDate.getFullYear() === currentYear;
    });

    // Si no hay pagos del año actual, está al día
    if (currentYearPayments.length === 0) {
      return EstadoPago.AL_DIA;
    }

    // Verificar si hay algún pago del año actual que no esté PAGADO
    for (const payment of currentYearPayments) {
      if (payment.status !== PaymentStatus.PAGADO) {
        return EstadoPago.CON_DEUDA;
      }
    }

    // Si todos los pagos del año actual están PAGADO, está al día
    return EstadoPago.AL_DIA;
  }

  async getAllTenants(_userId: number, year?: number): Promise<TenantDTO[]> {
    let entities: TenantEntity[];
    // Use optimized query if available
    if (this.tenantRepository.findAllWithRelations) {
      entities = await this.tenantRepository.findAllWithRelations();
    } else {
      entities = await this.tenantRepository.findAll();
    }

    // Actualizar estado de pago para cada tenant y obtener sus propiedades
    const updatedEntities = await Promise.all(
      entities.map(async (entity) => {
        if (entity.fechaInicioContrato) {
          const calculatedStatus = await this.calculatePaymentStatus(entity.id!, entity.fechaInicioContrato, year, entity.payments);

          // Si el estado calculado es diferente al actual, actualizar
          if (entity.estadoPago !== calculatedStatus) {
            entity.estadoPago = calculatedStatus;
            await this.tenantRepository.update(entity.id!, entity);
          }
        }

        // Obtener las propiedades asociadas al tenant (usar preloaded si existe)
        const properties = entity.properties || await this.propertyRepository.findByTenantId(entity.id!);
        // Obtener números de local únicos y ordenados
        const localNumbers = Array.from(new Set(properties.map((p: any) => p.localNumber))).sort((a, b) => a - b);

        // Agregar los números de local al DTO
        const dto = entity.toDTO();
        (dto as any).localNumbers = localNumbers;

        return dto;
      })
    );

    return updatedEntities;
  }

  async getTenantById(id: number, _userId: number): Promise<TenantDTO> {
    const entity = await this.tenantRepository.findById(id);
    if (!entity) {
      throw new NotFoundError('Tenant', id);
    }
    return entity.toDTO();
  }


  async getTenantByDocumentId(documentId: string, _userId: number): Promise<TenantDTO> {
    const entity = await this.tenantRepository.findByDocumentId(documentId);
    if (!entity) {
      throw new NotFoundError('Tenant', documentId);
    }
    return entity.toDTO();
  }

  async createTenant(data: CreateTenantDTO, _userId: number): Promise<TenantDTO> {
    // Check if document ID already exists
    const existingDocument = await this.tenantRepository.findByDocumentId(data.documentId);
    if (existingDocument) {
      throw new ConflictError(`Document ID ${data.documentId} already registered`);
    }

    // Create entity
    const entity = new TenantEntity(
      null,
      data.firstName,
      data.lastName,
      data.phone || null,
      data.documentId,
      data.numeroLocal || null,
      stringToRubro(data.rubro !== undefined ? data.rubro : null),
      data.fechaInicioContrato ? new Date(data.fechaInicioContrato) : null,
      'AL_DIA', // Estado inicial: al día
      new Date(),
      new Date()
    );

    // Validate
    entity.validate();

    // Save
    const created = await this.tenantRepository.create(entity);
    return created.toDTO();
  }

  async updateTenant(id: number, data: UpdateTenantDTO, _userId: number): Promise<TenantDTO> {
    const entity = await this.tenantRepository.findById(id);
    if (!entity) {
      throw new NotFoundError('Tenant', id);
    }

    // Validate documentId uniqueness if it's being changed
    if (data.documentId !== undefined && data.documentId !== entity.documentId) {
      const existingTenant = await this.tenantRepository.findByDocumentId(data.documentId);
      if (existingTenant && existingTenant.id !== id) {
        throw new BadRequestError(`El DNI ${data.documentId} ya está en uso por otro inquilino`);
      }
    }

    // Update fields
    if (data.firstName !== undefined) entity.firstName = data.firstName;
    if (data.lastName !== undefined) entity.lastName = data.lastName;
    if (data.phone !== undefined) entity.phone = data.phone;
    if (data.documentId !== undefined) entity.documentId = data.documentId;
    if (data.numeroLocal !== undefined) entity.numeroLocal = data.numeroLocal;
    if (data.rubro !== undefined) entity.rubro = stringToRubro(data.rubro);
    if (data.estadoPago !== undefined) {
      const estadoPago = stringToEstadoPago(data.estadoPago);
      if (estadoPago !== null) {
        entity.estadoPago = estadoPago;
      }
    }
    if (data.fechaInicioContrato !== undefined) {
      // Handle empty strings and validate date
      const dateStr = typeof data.fechaInicioContrato === 'string'
        ? data.fechaInicioContrato.trim()
        : data.fechaInicioContrato;

      if (!dateStr || dateStr === '') {
        entity.fechaInicioContrato = null;
      } else {
        const date = new Date(dateStr);
        // Validate that the date is valid
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date format: ${dateStr}`);
        }
        entity.fechaInicioContrato = date;
      }
    }

    entity.updatedAt = new Date();
    entity.validate();

    const updated = await this.tenantRepository.update(id, entity);
    return updated.toDTO();
  }

  async deleteTenant(id: number, _userId: number): Promise<boolean> {
    // Obtener el tenant para acceder a sus datos
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundError('Tenant', id);
    }

    // Actualizar pagos históricos con datos del tenant antes de eliminarlo
    const fullName = `${tenant.firstName} ${tenant.lastName}`;

    // Usar Prisma directamente para actualizar los campos históricos sin validación
    const { prisma } = await import('../../lib/prisma');
    // Preservar trazabilidad en pagos
    await prisma.payment.updateMany({
      where: { tenantId: id },
      data: {
        tenantFullName: fullName,
        tenantPhone: tenant.phone
      }
    });
    // Preservar trazabilidad en contratos
    await prisma.contract.updateMany({
      where: { tenantId: id },
      data: {
        tenantFullName: fullName
      }
    });

    // Liberar todas las propiedades asociadas (poner tenantId = null)
    const properties = await this.propertyRepository.findByTenantId(id);
    for (const property of properties) {
      property.tenantId = null;
      await this.propertyRepository.update(property);
    }

    // Liberar todos los contratos asociados (poner tenantId = null)
    // Usar SQL nativo ya que updateMany puede tener restricciones
    await prisma.$executeRaw`UPDATE contracts SET "tenantId" = NULL WHERE "tenantId" = ${id}`;

    // Eliminar el tenant
    const deleted = await this.tenantRepository.delete(id);
    return deleted;
  }
}

import { ITenantService } from '../../interfaces/services/ITenantService';
import { ITenantRepository } from '../../interfaces/repositories/ITenantRepository';
import { IPaymentRepository } from '../../interfaces/repositories/IPaymentRepository';
import { IPropertyRepository } from '../../interfaces/repositories/IPropertyRepository';
import { TenantDTO, CreateTenantDTO, UpdateTenantDTO } from '../../dtos/tenant.dto';
import { TenantEntity } from '../../entities/Tenant.entity';
import { EstadoPago, Rubro } from '@prisma/client';

// Helper function to convert string to Rubro enum
function stringToRubro(value: string | null): Rubro | null {
  if (!value) return null;
  switch (value.toUpperCase()) {
    case 'TIPEO': return Rubro.TIPEO;
    case 'PEDICURE': return Rubro.PEDICURE;
    default: return null;
  }
}

export class TenantService implements ITenantService {
  constructor(
    private tenantRepository: ITenantRepository,
    private paymentRepository: IPaymentRepository,
    private propertyRepository: IPropertyRepository
  ) {}

  /**
   * Calcula el estado de pago de un inquilino basado en su contrato y pagos realizados
   * Los contratos son por 1 año y se pagan mensualmente
   */
  private async calculatePaymentStatus(tenantId: number, fechaInicioContrato: Date | null): Promise<EstadoPago> {
    if (!fechaInicioContrato) {
      return EstadoPago.AL_DIA; // Si no hay fecha de inicio, asumimos al día
    }

    const now = new Date();
    const contractStart = new Date(fechaInicioContrato);

    // Si el contrato aún no ha empezado, está al día
    if (contractStart > now) {
      return EstadoPago.AL_DIA;
    }

    // Calcular meses transcurridos desde el inicio del contrato
    const monthsElapsed = Math.floor(
      (now.getTime() - contractStart.getTime()) / (1000 * 60 * 60 * 24 * 30.44) // Promedio de días por mes
    );

    // Si han pasado menos de 1 mes, está al día
    if (monthsElapsed < 1) {
      return EstadoPago.AL_DIA;
    }

    // Obtener todos los pagos del inquilino
    const payments = await this.paymentRepository.findByTenantId(tenantId);

    // Contar pagos completados por mes (si tiene paymentDate, está pagado)
    const completedPaymentsByMonth = new Set<number>();

    for (const payment of payments) {
      // Si tiene paymentDate, significa que fue pagado
      if (payment.paymentDate) {
        const paymentDate = new Date(payment.paymentDate);
        const monthsSinceContract = Math.floor(
          (paymentDate.getTime() - contractStart.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
        );
        if (monthsSinceContract >= 0 && monthsSinceContract <= 12) { // Solo considerar pagos dentro del año de contrato
          completedPaymentsByMonth.add(monthsSinceContract);
        }
      }
    }

    // Verificar si hay meses sin pago
    for (let month = 0; month < Math.min(monthsElapsed, 12); month++) {
      if (!completedPaymentsByMonth.has(month)) {
        return EstadoPago.CON_DEUDA;
      }
    }

    return EstadoPago.AL_DIA;
  }

  async getAllTenants(_userId: number): Promise<TenantDTO[]> {
    const entities = await this.tenantRepository.findAll();

    // Actualizar estado de pago para cada tenant
    const updatedEntities = await Promise.all(
      entities.map(async (entity) => {
        if (entity.fechaInicioContrato) {
          const calculatedStatus = await this.calculatePaymentStatus(entity.id!, entity.fechaInicioContrato);

          // Si el estado calculado es diferente al actual, actualizar
          if (entity.estadoPago !== calculatedStatus) {
            entity.estadoPago = calculatedStatus;
            await this.tenantRepository.update(entity.id!, entity);
          }
        }

        return entity;
      })
    );

    return updatedEntities.map(entity => entity.toDTO());
  }

  async getTenantById(id: number, _userId: number): Promise<TenantDTO> {
    const entity = await this.tenantRepository.findById(id);
    if (!entity) {
      throw new Error('Tenant not found');
    }
    return entity.toDTO();
  }


  async getTenantByDocumentId(documentId: string, _userId: number): Promise<TenantDTO> {
    const entity = await this.tenantRepository.findByDocumentId(documentId);
    if (!entity) {
      throw new Error('Tenant not found');
    }
    return entity.toDTO();
  }

  async createTenant(data: CreateTenantDTO, _userId: number): Promise<TenantDTO> {
    // Check if document ID already exists
    const existingDocument = await this.tenantRepository.findByDocumentId(data.documentId);
    if (existingDocument) {
      throw new Error('Document ID already registered');
    }

    // Create entity
    const entity = new TenantEntity(
      null,
      data.firstName,
      data.lastName,
      data.phone || null,
      data.documentId,
      data.address || null,
      data.birthDate ? new Date(data.birthDate) : null,
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
      throw new Error('Tenant not found');
    }

    // Update fields
    if (data.firstName !== undefined) entity.firstName = data.firstName;
    if (data.lastName !== undefined) entity.lastName = data.lastName;
    if (data.phone !== undefined) entity.phone = data.phone;
    if (data.address !== undefined) entity.address = data.address;
    if (data.birthDate !== undefined) {
      entity.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    }
    if (data.numeroLocal !== undefined) entity.numeroLocal = data.numeroLocal;
    if (data.rubro !== undefined) entity.rubro = stringToRubro(data.rubro);
    if (data.fechaInicioContrato !== undefined) {
      entity.fechaInicioContrato = data.fechaInicioContrato ? new Date(data.fechaInicioContrato) : null;
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
      throw new Error('Tenant not found');
    }

    // Actualizar pagos históricos con datos del tenant antes de eliminarlo
    const fullName = `${tenant.firstName} ${tenant.lastName}`;

    // Usar Prisma directamente para actualizar los campos históricos sin validación
    const { prisma } = await import('../../lib/prisma');
    await prisma.payment.updateMany({
      where: { tenantId: id },
      data: {
        tenantFullName: fullName,
        tenantPhone: tenant.phone
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

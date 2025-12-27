import { IPropertyService } from '../../interfaces/services/IPropertyService';
import { IPropertyRepository } from '../../interfaces/repositories/IPropertyRepository';
import { ITenantRepository } from '../../interfaces/repositories/ITenantRepository';
import { IPaymentRepository } from '../../interfaces/repositories/IPaymentRepository';
import { PropertyDTO, CreatePropertyDTO, UpdatePropertyDTO } from '../../dtos/property.dto';
import { PropertyEntity } from '../../entities/Property.entity';
import { NotFoundError, ConflictError, BadRequestError } from '../../exceptions';

export class PropertyService implements IPropertyService {
  constructor(
    private propertyRepository: IPropertyRepository,
    private tenantRepository: ITenantRepository,
    private _paymentRepository: IPaymentRepository
  ) {
    // Reference to avoid TS unused property warning (injected for future use)
    void this._paymentRepository;
  }

  async getAllProperties(_userId: number): Promise<PropertyDTO[]> {
    const entities = await this.propertyRepository.findAll();

    // Get tenant information for each property
    const propertiesWithTenants = await Promise.all(
      entities.map(async (entity) => {
        const dto = entity.toDTO() as PropertyDTO & { tenant?: any };

        // Get tenant info if tenantId exists
        if (entity.tenantId) {
          const tenant = await this.tenantRepository.findById(entity.tenantId);
          if (tenant) {
            dto.tenant = {
              id: tenant.id,
              firstName: tenant.firstName,
              lastName: tenant.lastName,
              email: '', // Tenant model doesn't have email field
            };
          }
        }

        return dto;
      })
    );

    return propertiesWithTenants;
  }

  async getPropertyById(id: number, _userId: number): Promise<PropertyDTO> {
    const entity = await this.propertyRepository.findById(id);
    if (!entity) {
      throw new NotFoundError('Property', id);
    }

    const dto = entity.toDTO() as PropertyDTO & { tenant?: any };

    // Get tenant info if tenantId exists
    if (entity.tenantId) {
      const tenant = await this.tenantRepository.findById(entity.tenantId);
      if (tenant) {
        dto.tenant = {
          id: tenant.id,
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          email: '', // Tenant model doesn't have email field
        };
      }
    }

    return dto;
  }

  async createProperty(data: CreatePropertyDTO, _userId: number): Promise<PropertyDTO> {
    // Validar que no exista un local con el mismo número
    const existingProperty = await this.propertyRepository.findByLocalNumber(data.localNumber);
    if (existingProperty) {
      throw new ConflictError(`Ya existe un local con el número ${data.localNumber}`);
    }

    const entity = PropertyEntity.create(data);
    const savedEntity = await this.propertyRepository.create(entity);
    return savedEntity.toDTO();
  }

  async updateProperty(id: number, data: UpdatePropertyDTO, _userId: number): Promise<PropertyDTO> {
    const existingEntity = await this.propertyRepository.findById(id);
    if (!existingEntity) {
      throw new NotFoundError('Property', id);
    }

    const updatedEntity = existingEntity.update(data);
    const savedEntity = await this.propertyRepository.update(updatedEntity);
    return savedEntity.toDTO();
  }

  async releaseProperty(id: number, _userId: number): Promise<PropertyDTO> {
    const property = await this.propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundError('Property', id);
    }

    if (!property.tenantId) {
      throw new BadRequestError('Property is already available (no tenant assigned)');
    }

    // Liberar la propiedad cambiando tenantId a null
    const updateData = {
      tenantId: null as number | null,
      updatedAt: new Date()
    };

    const updatedEntity = property.update(updateData);
    const savedEntity = await this.propertyRepository.update(updatedEntity);
    return savedEntity.toDTO();
  }

  async deleteProperty(id: number, _userId: number): Promise<boolean> {
    // Verificar que la propiedad existe
    const property = await this.propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundError('Property', id);
    }

    // Liberar todos los pagos asociados (poner propertyId = null)
    // Usar SQL nativo ya que updateMany puede tener restricciones
    const { prisma } = await import('../../lib/prisma');
    await prisma.$executeRaw`UPDATE payments SET "propertyId" = NULL WHERE "propertyId" = ${id}`;

    // Eliminar la propiedad
    const deleted = await this.propertyRepository.delete(id);
    return deleted;
  }
}

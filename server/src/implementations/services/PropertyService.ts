import { IPropertyService } from '../../interfaces/services/IPropertyService';
import { IPropertyRepository } from '../../interfaces/repositories/IPropertyRepository';
import { ITenantRepository } from '../../interfaces/repositories/ITenantRepository';
import { PropertyDTO, CreatePropertyDTO, UpdatePropertyDTO } from '../../dtos/property.dto';
import { PropertyEntity } from '../../entities/Property.entity';

export class PropertyService implements IPropertyService {
  constructor(
    private propertyRepository: IPropertyRepository,
    private tenantRepository: ITenantRepository
  ) {}

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
              documentId: tenant.documentId,
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
      throw new Error('Property not found');
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
          documentId: tenant.documentId,
        };
      }
    }

    return dto;
  }

  async createProperty(data: CreatePropertyDTO, _userId: number): Promise<PropertyDTO> {
    const entity = PropertyEntity.create(data);
    const savedEntity = await this.propertyRepository.create(entity);
    return savedEntity.toDTO();
  }

  async updateProperty(id: number, data: UpdatePropertyDTO, _userId: number): Promise<PropertyDTO> {
    const existingEntity = await this.propertyRepository.findById(id);
    if (!existingEntity) {
      throw new Error('Property not found');
    }

    const updatedEntity = existingEntity.update(data);
    const savedEntity = await this.propertyRepository.update(updatedEntity);
    return savedEntity.toDTO();
  }

  async releaseProperty(id: number, _userId: number): Promise<PropertyDTO> {
    const property = await this.propertyRepository.findById(id);
    if (!property) {
      throw new Error('Property not found');
    }

    if (!property.tenantId) {
      throw new Error('Property is already available (no tenant assigned)');
    }

    // Liberar la propiedad cambiando tenantId a null
    const updateData: Partial<PropertyEntity> = {
      id: property.id,
      tenantId: null,
      updatedAt: new Date()
    };

    const updated = await this.propertyRepository.update(updateData as PropertyEntity);
    return updated.toDTO();
  }

  async deleteProperty(id: number, _userId: number): Promise<boolean> {
    const deleted = await this.propertyRepository.delete(id);
    return deleted;
  }
}

import { IRentalService } from '../../interfaces/services/IRentalService';
import { IRentalRepository } from '../../interfaces/repositories/IRentalRepository';
import { ITenantRepository } from '../../interfaces/repositories/ITenantRepository';
import { IPropertyRepository } from '../../interfaces/repositories/IPropertyRepository';
import { RentalDTO, CreateRentalDTO, UpdateRentalDTO } from '../../dtos/rental.dto';
import { RentalEntity } from '../../entities/Rental.entity';
import { NotFoundError, BadRequestError } from '../../exceptions';

export class RentalService implements IRentalService {
  constructor(
    private rentalRepository: IRentalRepository,
    private tenantRepository: ITenantRepository,
    private propertyRepository: IPropertyRepository
  ) {}

  async getAllRentals(_userId: number): Promise<RentalDTO[]> {
    const entities = await this.rentalRepository.findAll();

    // Get all rentals with tenant and property info
    const rentalsWithDetails = await Promise.all(
      entities.map(async (entity) => {
        const dto = entity.toDTO() as RentalDTO & { tenant?: any; property?: any };

        // Add tenant info
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

        // Add property info
        if (entity.propertyId) {
          const property = await this.propertyRepository.findById(entity.propertyId);
          if (property) {
            dto.property = {
              id: property.id,
              ubicacion: property.ubicacion,
              localNumber: property.localNumber,
            };
          }
        }

        return dto;
      })
    );

    return rentalsWithDetails;
  }

  async getRentalById(id: number, _userId: number): Promise<RentalDTO> {
    const entity = await this.rentalRepository.findById(id);
    if (!entity) {
      throw new NotFoundError('Rental', id);
    }

    const dto = entity.toDTO() as RentalDTO & { tenant?: any; property?: any };

    // Add tenant info
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

    // Add property info
    if (entity.propertyId) {
      const property = await this.propertyRepository.findById(entity.propertyId);
      if (property) {
        dto.property = {
          id: property.id,
          ubicacion: property.ubicacion,
          localNumber: property.localNumber,
        };
      }
    }

    return dto;
  }

  async createRental(data: CreateRentalDTO, _userId: number): Promise<RentalDTO> {
    // Validate that tenant exists
    const tenant = await this.tenantRepository.findById(data.tenantId);
    if (!tenant) {
      throw new NotFoundError('Tenant', data.tenantId);
    }

    // Validate that property exists and is available (tenantId is null)
    const property = await this.propertyRepository.findById(data.propertyId);
    if (!property) {
      throw new NotFoundError('Property', data.propertyId);
    }
    if (property.tenantId !== null) {
      throw new BadRequestError('Property is not available for rental');
    }

    const entity = RentalEntity.create(data);
    const savedEntity = await this.rentalRepository.create(entity);

    // Mark property as not available by assigning tenant
    property.tenantId = data.tenantId;
    await this.propertyRepository.update(property);

    return savedEntity.toDTO();
  }

  async updateRental(id: number, data: UpdateRentalDTO, _userId: number): Promise<RentalDTO> {
    const existingEntity = await this.rentalRepository.findById(id);
    if (!existingEntity) {
      throw new NotFoundError('Rental', id);
    }

    // If changing tenant, validate new tenant exists
    if (data.tenantId && data.tenantId !== existingEntity.tenantId) {
      const tenant = await this.tenantRepository.findById(data.tenantId);
      if (!tenant) {
        throw new NotFoundError('Tenant', data.tenantId);
      }
    }

    // If changing property, validate new property exists and is available (tenantId is null)
    if (data.propertyId && data.propertyId !== existingEntity.propertyId) {
      const property = await this.propertyRepository.findById(data.propertyId);
      if (!property) {
        throw new NotFoundError('Property', data.propertyId);
      }
      if (property.tenantId !== null) {
        throw new BadRequestError('New property is not available for rental');
      }

      // Mark old property as available (set tenantId to null) and new property as not available (assign tenant)
      const oldProperty = await this.propertyRepository.findById(existingEntity.propertyId);
      if (oldProperty) {
        oldProperty.tenantId = null;
        await this.propertyRepository.update(oldProperty);
      }
      property.tenantId = data.tenantId || existingEntity.tenantId;
      await this.propertyRepository.update(property);
    }

    const updatedEntity = existingEntity.update(data);
    const savedEntity = await this.rentalRepository.update(updatedEntity);
    return savedEntity.toDTO();
  }

  async deleteRental(id: number, _userId: number): Promise<boolean> {
    const entity = await this.rentalRepository.findById(id);
    if (!entity) {
      return false; // Rental not found
    }

    // Mark property as available again (set tenantId to null)
    const property = await this.propertyRepository.findById(entity.propertyId);
    if (property) {
      property.tenantId = null;
      await this.propertyRepository.update(property);
    }

    const deleted = await this.rentalRepository.delete(id);
    return deleted;
  }
}

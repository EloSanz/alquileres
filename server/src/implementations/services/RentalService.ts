import { IRentalService } from '../../interfaces/services/IRentalService';
import { IRentalRepository } from '../../interfaces/repositories/IRentalRepository';
import { ITenantRepository } from '../../interfaces/repositories/ITenantRepository';
import { IPropertyRepository } from '../../interfaces/repositories/IPropertyRepository';
import { RentalDTO, CreateRentalDTO, UpdateRentalDTO } from '../../dtos/rental.dto';
import { RentalEntity } from '../../entities/Rental.entity';

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
              name: property.name,
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
      throw new Error('Rental not found');
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
          name: property.name,
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
      throw new Error('Tenant not found');
    }

    // Validate that property exists and is available
    const property = await this.propertyRepository.findById(data.propertyId);
    if (!property) {
      throw new Error('Property not found');
    }
    if (!property.isAvailable) {
      throw new Error('Property is not available for rental');
    }

    const entity = RentalEntity.create(data);
    const savedEntity = await this.rentalRepository.create(entity);

    // Mark property as not available
    property.isAvailable = false;
    await this.propertyRepository.update(property);

    return savedEntity.toDTO();
  }

  async updateRental(id: number, data: UpdateRentalDTO, _userId: number): Promise<RentalDTO> {
    const existingEntity = await this.rentalRepository.findById(id);
    if (!existingEntity) {
      throw new Error('Rental not found');
    }

    // If changing tenant, validate new tenant exists
    if (data.tenantId && data.tenantId !== existingEntity.tenantId) {
      const tenant = await this.tenantRepository.findById(data.tenantId);
      if (!tenant) {
        throw new Error('New tenant not found');
      }
    }

    // If changing property, validate new property exists and is available
    if (data.propertyId && data.propertyId !== existingEntity.propertyId) {
      const property = await this.propertyRepository.findById(data.propertyId);
      if (!property) {
        throw new Error('New property not found');
      }
      if (!property.isAvailable) {
        throw new Error('New property is not available for rental');
      }

      // Mark old property as available and new property as not available
      const oldProperty = await this.propertyRepository.findById(existingEntity.propertyId);
      if (oldProperty) {
        oldProperty.isAvailable = true;
        await this.propertyRepository.update(oldProperty);
      }
      property.isAvailable = false;
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

    // Mark property as available again
    const property = await this.propertyRepository.findById(entity.propertyId);
    if (property) {
      property.isAvailable = true;
      await this.propertyRepository.update(property);
    }

    const deleted = await this.rentalRepository.delete(id);
    return deleted;
  }
}

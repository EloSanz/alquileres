import { ITenantService } from '../../interfaces/services/ITenantService';
import { ITenantRepository } from '../../interfaces/repositories/ITenantRepository';
import { TenantDTO, CreateTenantDTO, UpdateTenantDTO } from '../../dtos/tenant.dto';
import { TenantEntity } from '../../entities/Tenant.entity';

export class TenantService implements ITenantService {
  constructor(private tenantRepository: ITenantRepository) {}

  async getAllTenants(_userId: number): Promise<TenantDTO[]> {
    const entities = await this.tenantRepository.findAll();
    return entities.map(entity => entity.toDTO());
  }

  async getTenantById(id: number, _userId: number): Promise<TenantDTO> {
    const entity = await this.tenantRepository.findById(id);
    if (!entity) {
      throw new Error('Tenant not found');
    }
    return entity.toDTO();
  }

  async getTenantByEmail(email: string, _userId: number): Promise<TenantDTO> {
    const entity = await this.tenantRepository.findByEmail(email);
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
    // Check if email already exists
    const existingEmail = await this.tenantRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new Error('Email already registered');
    }

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
      data.email,
      data.phone || null,
      data.documentId,
      data.address || null,
      data.birthDate ? new Date(data.birthDate) : null,
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

    // Check email uniqueness if updating email
    if (data.email) {
      const existingEmail = await this.tenantRepository.findByEmail(data.email);
      if (existingEmail && existingEmail.id !== id) {
        throw new Error('Email already in use');
      }
      entity.email = data.email;
    }

    // Update other fields
    if (data.firstName) entity.firstName = data.firstName;
    if (data.lastName) entity.lastName = data.lastName;
    if (data.phone !== undefined) entity.phone = data.phone;
    if (data.address !== undefined) entity.address = data.address;
    if (data.birthDate !== undefined) {
      entity.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    }

    entity.updatedAt = new Date();
    entity.validate();

    const updated = await this.tenantRepository.update(id, entity);
    return updated.toDTO();
  }

  async deleteTenant(id: number, _userId: number): Promise<boolean> {
    const deleted = await this.tenantRepository.delete(id);
    return deleted;
  }
}

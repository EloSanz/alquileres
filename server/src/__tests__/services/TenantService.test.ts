import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TenantService } from '../../implementations/services/TenantService'
import { ITenantRepository } from '../../interfaces/repositories/ITenantRepository'
import { TenantEntity } from '../../entities/Tenant.entity'

// Mock del repository
const mockTenantRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findByDocumentId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
} as unknown as ITenantRepository

describe('TenantService', () => {
  let tenantService: TenantService

  beforeEach(() => {
    vi.clearAllMocks()
    tenantService = new TenantService(mockTenantRepository)
  })

  describe('getAllTenants', () => {
    it('should return all tenants as DTOs', async () => {
      const mockEntity = new TenantEntity(
        1,
        'John',
        'Doe',
        'john@example.com',
        '+1234567890',
        '123456789',
        '123 Main St',
        new Date('1990-01-01'),
        new Date(),
        new Date()
      )

      mockTenantRepository.findAll.mockResolvedValue([mockEntity])

      const result = await tenantService.getAllTenants()

      expect(mockTenantRepository.findAll).toHaveBeenCalledTimes(1)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(mockEntity.toDTO())
    })

    it('should return empty array when no tenants exist', async () => {
      mockTenantRepository.findAll.mockResolvedValue([])

      const result = await tenantService.getAllTenants()

      expect(result).toEqual([])
    })
  })

  describe('getTenantById', () => {
    it('should return tenant DTO when found', async () => {
      const mockEntity = new TenantEntity(
        1,
        'John',
        'Doe',
        'john@example.com',
        '+1234567890',
        '123456789',
        '123 Main St',
        new Date('1990-01-01'),
        new Date(),
        new Date()
      )

      mockTenantRepository.findById.mockResolvedValue(mockEntity)

      const result = await tenantService.getTenantById(1)

      expect(mockTenantRepository.findById).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockEntity.toDTO())
    })

    it('should throw error when tenant not found', async () => {
      mockTenantRepository.findById.mockResolvedValue(null)

      await expect(tenantService.getTenantById(999)).rejects.toThrow('Tenant not found')
    })
  })

  describe('createTenant', () => {
    const validCreateData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '+0987654321',
      documentId: '987654321',
      address: '456 Oak St',
      birthDate: '1985-05-15'
    }

    it('should create tenant successfully', async () => {
      const mockCreatedEntity = new TenantEntity(
        1,
        validCreateData.firstName,
        validCreateData.lastName,
        validCreateData.email,
        validCreateData.phone,
        validCreateData.documentId,
        validCreateData.address,
        new Date(validCreateData.birthDate),
        new Date(),
        new Date()
      )

      mockTenantRepository.findByEmail.mockResolvedValue(null)
      mockTenantRepository.findByDocumentId.mockResolvedValue(null)
      mockTenantRepository.create.mockResolvedValue(mockCreatedEntity)

      const result = await tenantService.createTenant(validCreateData)

      expect(mockTenantRepository.findByEmail).toHaveBeenCalledWith(validCreateData.email)
      expect(mockTenantRepository.findByDocumentId).toHaveBeenCalledWith(validCreateData.documentId)
      expect(mockTenantRepository.create).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockCreatedEntity.toDTO())
    })

    it('should throw error when email already exists', async () => {
      const existingEntity = new TenantEntity(
        1, 'Existing', 'User', validCreateData.email,
        null, '111111111', null, null, new Date(), new Date()
      )

      mockTenantRepository.findByEmail.mockResolvedValue(existingEntity)

      await expect(tenantService.createTenant(validCreateData))
        .rejects.toThrow('Email already registered')
    })

    it('should throw error when document ID already exists', async () => {
      const existingEntity = new TenantEntity(
        1, 'Existing', 'User', 'existing@example.com',
        null, validCreateData.documentId, null, null, new Date(), new Date()
      )

      mockTenantRepository.findByEmail.mockResolvedValue(null)
      mockTenantRepository.findByDocumentId.mockResolvedValue(existingEntity)

      await expect(tenantService.createTenant(validCreateData))
        .rejects.toThrow('Document ID already registered')
    })

    it('should handle optional fields correctly', async () => {
      const minimalData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        documentId: '123456789'
      }

      const mockCreatedEntity = new TenantEntity(
        1,
        minimalData.firstName,
        minimalData.lastName,
        minimalData.email,
        null,
        minimalData.documentId,
        null,
        null,
        new Date(),
        new Date()
      )

      mockTenantRepository.findByEmail.mockResolvedValue(null)
      mockTenantRepository.findByDocumentId.mockResolvedValue(null)
      mockTenantRepository.create.mockResolvedValue(mockCreatedEntity)

      const result = await tenantService.createTenant(minimalData)

      expect(result.phone).toBeNull()
      expect(result.address).toBeNull()
      expect(result.birthDate).toBeNull()
    })
  })

  describe('updateTenant', () => {
    const validUpdateData = {
      firstName: 'Updated',
      lastName: 'Name',
      email: 'updated@example.com',
      phone: '+1111111111'
    }

    it('should update tenant successfully', async () => {
      const existingEntity = new TenantEntity(
        1, 'Old', 'Name', 'old@example.com',
        '+0000000000', '123456789', 'Old Address',
        new Date('1990-01-01'), new Date(), new Date()
      )

      const updatedEntity = new TenantEntity(
        1, 'Updated', 'Name', 'updated@example.com',
        '+1111111111', '123456789', 'Old Address',
        new Date('1990-01-01'), new Date(), new Date()
      )

      mockTenantRepository.findById.mockResolvedValue(existingEntity)
      mockTenantRepository.findByEmail.mockResolvedValue(null)
      mockTenantRepository.update.mockResolvedValue(updatedEntity)

      const result = await tenantService.updateTenant(1, validUpdateData)

      expect(mockTenantRepository.findById).toHaveBeenCalledWith(1)
      expect(mockTenantRepository.findByEmail).toHaveBeenCalledWith(validUpdateData.email)
      expect(result.firstName).toBe('Updated')
      expect(result.email).toBe('updated@example.com')
    })

    it('should throw error when tenant not found', async () => {
      mockTenantRepository.findById.mockResolvedValue(null)

      await expect(tenantService.updateTenant(999, validUpdateData))
        .rejects.toThrow('Tenant not found')
    })

    it('should throw error when updating to existing email', async () => {
      const existingEntity = new TenantEntity(
        1, 'John', 'Doe', 'john@example.com',
        null, '123456789', null, null, new Date(), new Date()
      )

      const conflictingEntity = new TenantEntity(
        2, 'Jane', 'Smith', validUpdateData.email,
        null, '987654321', null, null, new Date(), new Date()
      )

      mockTenantRepository.findById.mockResolvedValue(existingEntity)
      mockTenantRepository.findByEmail.mockResolvedValue(conflictingEntity)

      await expect(tenantService.updateTenant(1, validUpdateData))
        .rejects.toThrow('Email already in use')
    })
  })

  describe('deleteTenant', () => {
    it('should delete tenant successfully', async () => {
      const existingEntity = new TenantEntity(
        1, 'John', 'Doe', 'john@example.com',
        null, '123456789', null, null, new Date(), new Date()
      )

      mockTenantRepository.findById.mockResolvedValue(existingEntity)
      mockTenantRepository.delete.mockResolvedValue(undefined)

      await expect(tenantService.deleteTenant(1)).resolves.toBeUndefined()

      expect(mockTenantRepository.findById).toHaveBeenCalledWith(1)
      expect(mockTenantRepository.delete).toHaveBeenCalledWith(1)
    })

    it('should throw error when tenant not found', async () => {
      mockTenantRepository.findById.mockResolvedValue(null)

      await expect(tenantService.deleteTenant(999)).rejects.toThrow('Tenant not found')
    })
  })
})

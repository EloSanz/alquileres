import { describe, it, expect } from 'vitest'
import { TenantEntity } from '../../entities/Tenant.entity'

describe('TenantEntity', () => {
  const validTenantData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    documentId: '123456789',
    address: '123 Main St',
    birthDate: new Date('1990-01-01')
  }

  describe('Entity Creation', () => {
    it('should create a tenant entity with valid data', () => {
      const entity = new TenantEntity(
        null,
        validTenantData.firstName,
        validTenantData.lastName,
        validTenantData.email,
        validTenantData.phone,
        validTenantData.documentId,
        validTenantData.address,
        validTenantData.birthDate,
        new Date(),
        new Date()
      )

      expect(entity.firstName).toBe(validTenantData.firstName)
      expect(entity.lastName).toBe(validTenantData.lastName)
      expect(entity.email).toBe(validTenantData.email)
      expect(entity.phone).toBe(validTenantData.phone)
      expect(entity.documentId).toBe(validTenantData.documentId)
      expect(entity.address).toBe(validTenantData.address)
      expect(entity.birthDate).toBe(validTenantData.birthDate)
    })

    it('should create entity with null optional fields', () => {
      const entity = new TenantEntity(
        null,
        'Jane',
        'Smith',
        'jane@example.com',
        null,
        '987654321',
        null,
        null,
        new Date(),
        new Date()
      )

      expect(entity.phone).toBeNull()
      expect(entity.address).toBeNull()
      expect(entity.birthDate).toBeNull()
    })
  })

  describe('Validation', () => {
    it('should pass validation with valid data', () => {
      const entity = new TenantEntity(
        null,
        validTenantData.firstName,
        validTenantData.lastName,
        validTenantData.email,
        validTenantData.phone,
        validTenantData.documentId,
        validTenantData.address,
        validTenantData.birthDate,
        new Date(),
        new Date()
      )

      expect(() => entity.validate()).not.toThrow()
    })

    it('should throw error for invalid firstName', () => {
      const entity = new TenantEntity(
        null,
        '', // Invalid: empty string
        validTenantData.lastName,
        validTenantData.email,
        validTenantData.phone,
        validTenantData.documentId,
        validTenantData.address,
        validTenantData.birthDate,
        new Date(),
        new Date()
      )

      expect(() => entity.validate()).toThrow('First name must be at least 2 characters')
    })

    it('should throw error for invalid email', () => {
      const entity = new TenantEntity(
        null,
        validTenantData.firstName,
        validTenantData.lastName,
        'invalid-email', // Invalid: no @ symbol
        validTenantData.phone,
        validTenantData.documentId,
        validTenantData.address,
        validTenantData.birthDate,
        new Date(),
        new Date()
      )

      expect(() => entity.validate()).toThrow('Invalid email address')
    })

    it('should throw error for invalid documentId', () => {
      const entity = new TenantEntity(
        null,
        validTenantData.firstName,
        validTenantData.lastName,
        validTenantData.email,
        validTenantData.phone,
        '123', // Invalid: less than 5 characters
        validTenantData.address,
        validTenantData.birthDate,
        new Date(),
        new Date()
      )

      expect(() => entity.validate()).toThrow('Document ID must be at least 5 characters')
    })
  })

  describe('DTO Conversion', () => {
    it('should convert entity to DTO correctly', () => {
      const entity = new TenantEntity(
        1,
        validTenantData.firstName,
        validTenantData.lastName,
        validTenantData.email,
        validTenantData.phone,
        validTenantData.documentId,
        validTenantData.address,
        validTenantData.birthDate,
        new Date('2024-01-01'),
        new Date('2024-01-02')
      )

      const dto = entity.toDTO()

      expect(dto).toEqual({
        id: 1,
        firstName: validTenantData.firstName,
        lastName: validTenantData.lastName,
        email: validTenantData.email,
        phone: validTenantData.phone,
        documentId: validTenantData.documentId,
        address: validTenantData.address,
        birthDate: validTenantData.birthDate.toISOString(),
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z'
      })
    })

    it('should handle null values in DTO', () => {
      const entity = new TenantEntity(
        1,
        'Jane',
        'Smith',
        'jane@example.com',
        null,
        '987654321',
        null,
        null,
        new Date('2024-01-01'),
        new Date('2024-01-02')
      )

      const dto = entity.toDTO()

      expect(dto.phone).toBeNull()
      expect(dto.address).toBeNull()
      // birthDate is null, so it should be null in the DTO
      expect(dto.birthDate).toBeNull()
    })
  })

  describe('Prisma Conversion', () => {
    it('should convert entity to Prisma format', () => {
      const entity = new TenantEntity(
        1,
        validTenantData.firstName,
        validTenantData.lastName,
        validTenantData.email,
        validTenantData.phone,
        validTenantData.documentId,
        validTenantData.address,
        validTenantData.birthDate,
        new Date('2024-01-01'),
        new Date('2024-01-02')
      )

      const prismaData = entity.toPrisma()

      expect(prismaData).toEqual({
        id: 1,
        firstName: validTenantData.firstName,
        lastName: validTenantData.lastName,
        email: validTenantData.email,
        phone: validTenantData.phone,
        documentId: validTenantData.documentId,
        address: validTenantData.address,
        birthDate: validTenantData.birthDate,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02')
      })
    })
  })
})

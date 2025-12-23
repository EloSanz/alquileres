import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TenantController } from '../../controllers/tenant.controller'
import { ITenantService } from '../../interfaces/services/ITenantService'
import { TenantDTO } from '../../entities/Tenant.entity'

// Mock del service
const mockTenantService = {
  getAllTenants: vi.fn(),
  getTenantById: vi.fn(),
  getTenantByEmail: vi.fn(),
  getTenantByDocumentId: vi.fn(),
  createTenant: vi.fn(),
  updateTenant: vi.fn(),
  deleteTenant: vi.fn()
} as unknown as ITenantService

describe('TenantController', () => {
  let tenantController: TenantController

  beforeEach(() => {
    vi.clearAllMocks()
    tenantController = new TenantController(mockTenantService)
  })

  describe('getAll', () => {
    it('should return success response with tenants data', async () => {
      const mockTenants: TenantDTO[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          documentId: '123456789',
          address: '123 Main St',
          birthDate: '1990-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ]

      mockTenantService.getAllTenants.mockResolvedValue(mockTenants)

      const result = await tenantController.getAll()

      expect(mockTenantService.getAllTenants).toHaveBeenCalledTimes(1)
      expect(result).toEqual({
        success: true,
        message: 'Tenants retrieved successfully',
        data: mockTenants,
        timestamp: expect.any(String)
      })
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('should handle empty tenants list', async () => {
      mockTenantService.getAllTenants.mockResolvedValue([])

      const result = await tenantController.getAll()

      expect(result.data).toEqual([])
      expect(result.success).toBe(true)
    })
  })

  describe('getById', () => {
    it('should return success response with tenant data', async () => {
      const mockTenant: TenantDTO = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        documentId: '123456789',
        address: '123 Main St',
        birthDate: '1990-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }

      mockTenantService.getTenantById.mockResolvedValue(mockTenant)

      const result = await tenantController.getById({ params: { id: 1 } })

      expect(mockTenantService.getTenantById).toHaveBeenCalledWith(1)
      expect(result).toEqual({
        success: true,
        message: 'Tenant retrieved successfully',
        data: mockTenant,
        timestamp: expect.any(String)
      })
    })

    it('should handle service errors', async () => {
      mockTenantService.getTenantById.mockRejectedValue(new Error('Tenant not found'))

      await expect(tenantController.getById({ params: { id: 999 } }))
        .rejects.toThrow('Tenant not found')
    })
  })

  describe('create', () => {
    const validCreateData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '+0987654321',
      documentId: '987654321',
      address: '456 Oak St',
      birthDate: '1985-05-15'
    }

    it('should return success response when tenant is created', async () => {
      const mockCreatedTenant: TenantDTO = {
        id: 1,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+0987654321',
        documentId: '987654321',
        address: '456 Oak St',
        birthDate: '1985-05-15T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }

      mockTenantService.createTenant.mockResolvedValue(mockCreatedTenant)

      const result = await tenantController.create({ body: validCreateData })

      expect(mockTenantService.createTenant).toHaveBeenCalledWith(validCreateData)
      expect(result).toEqual({
        success: true,
        message: 'Tenant created successfully',
        data: mockCreatedTenant,
        timestamp: expect.any(String)
      })
    })

    it('should handle validation errors from service', async () => {
      mockTenantService.createTenant.mockRejectedValue(new Error('Email already registered'))

      await expect(tenantController.create({ body: validCreateData }))
        .rejects.toThrow('Email already registered')
    })
  })

  describe('update', () => {
    const validUpdateData = {
      firstName: 'Updated',
      lastName: 'Name',
      email: 'updated@example.com'
    }

    it('should return success response when tenant is updated', async () => {
      const mockUpdatedTenant: TenantDTO = {
        id: 1,
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated@example.com',
        phone: '+1234567890',
        documentId: '123456789',
        address: '123 Main St',
        birthDate: '1990-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z'
      }

      mockTenantService.updateTenant.mockResolvedValue(mockUpdatedTenant)

      const result = await tenantController.update({
        params: { id: 1 },
        body: validUpdateData
      })

      expect(mockTenantService.updateTenant).toHaveBeenCalledWith(1, validUpdateData)
      expect(result).toEqual({
        success: true,
        message: 'Tenant updated successfully',
        data: mockUpdatedTenant,
        timestamp: expect.any(String)
      })
    })
  })

  describe('delete', () => {
    it('should return success response when tenant is deleted', async () => {
      mockTenantService.deleteTenant.mockResolvedValue(undefined)

      const result = await tenantController.delete({ params: { id: 1 } })

      expect(mockTenantService.deleteTenant).toHaveBeenCalledWith(1)
      expect(result).toEqual({
        success: true,
        message: 'Tenant deleted successfully',
        data: null,
        timestamp: expect.any(String)
      })
    })

    it('should handle service errors during deletion', async () => {
      mockTenantService.deleteTenant.mockRejectedValue(new Error('Tenant not found'))

      await expect(tenantController.delete({ params: { id: 999 } }))
        .rejects.toThrow('Tenant not found')
    })
  })

  describe('Response Structure', () => {
    it('should always include required fields in response', async () => {
      mockTenantService.getAllTenants.mockResolvedValue([])

      const result = await tenantController.getAll()

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('timestamp')
      expect(typeof result.timestamp).toBe('string')
    })

    it('should have consistent timestamp format', async () => {
      mockTenantService.getAllTenants.mockResolvedValue([])

      const result = await tenantController.getAll()

      // Should be ISO string format
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })
  })
})

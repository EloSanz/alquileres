import { useApi } from '../contexts/ApiContext'

export interface Tenant {
  id: number
  firstName: string
  lastName: string
  phone?: string | null
  documentId: string
  address?: string | null
  birthDate?: string | null
  numeroLocal?: string | null
  rubro?: string | null
  fechaInicioContrato?: string | null
  estadoPago: string
  createdAt: string
  updatedAt: string
}

export interface CreateTenantData {
  firstName: string
  lastName: string
  phone?: string
  documentId: string
  address?: string
  birthDate?: string
  numeroLocal?: string
  rubro?: string
  fechaInicioContrato?: string
}

export interface UpdateTenantData {
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  birthDate?: string
  numeroLocal?: string
  rubro?: string
  fechaInicioContrato?: string
}

export const useTenantService = () => {
  const api = useApi()
  
  return {
    getAllTenants: async (): Promise<Tenant[]> => {
      const response = await api.api.tenants.get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch tenants'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch tenants')
      }
      return response.data.data || []
    },
    
    getTenantById: async (id: number): Promise<Tenant> => {
      const response = await api.api.tenants({ id }).get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch tenant'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch tenant')
      }
      return response.data.data
    },
    
    getTenantByDocumentId: async (documentId: string): Promise<Tenant> => {
      const response = await api.api.tenants.document({ documentId }).get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch tenant'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch tenant')
      }
      return response.data.data
    },
    
    createTenant: async (tenantData: CreateTenantData): Promise<Tenant> => {
      const response = await api.api.tenants.post(tenantData as any)
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to create tenant'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to create tenant')
      }
      return response.data.data
    },
    
    updateTenant: async (id: number, tenantData: UpdateTenantData): Promise<Tenant> => {
      const response = await api.api.tenants({ id }).put(tenantData)
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to update tenant'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update tenant')
      }
      return response.data.data
    },
    
    deleteTenant: async (id: number): Promise<void> => {
      const response = await api.api.tenants({ id }).delete()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to delete tenant'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to delete tenant')
      }
    }
  }
}


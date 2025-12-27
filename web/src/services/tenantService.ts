import { useApi, checkAuthError } from '../contexts/ApiContext'
import { Tenant, CreateTenant, UpdateTenant } from '../../../shared/types/Tenant'

export const useTenantService = () => {
  const api = useApi()
  
  return {
    getAllTenants: async (): Promise<Tenant[]> => {
      const response = await api.pentamont.api.tenants.get()
      if (response.error) {
        // Verificar si es un error de autenticación y redirigir
        if (checkAuthError(response.error)) {
          throw new Error('Authentication required')
        }
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch tenants'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch tenants')
      }
      return (response.data.data || []).map((item: any) => Tenant.fromJSON(item))
    },
    
    getTenantById: async (id: number): Promise<Tenant> => {
      const response = await api.pentamont.api.tenants({ id }).get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch tenant'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch tenant')
      }
      return Tenant.fromJSON(response.data.data)
    },
    
    getTenantByDocumentId: async (documentId: string): Promise<Tenant> => {
      const response = await api.pentamont.api.tenants.document({ documentId }).get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch tenant'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch tenant')
      }
      return Tenant.fromJSON(response.data.data)
    },
    
    createTenant: async (tenantData: CreateTenant): Promise<Tenant> => {
      const errors = tenantData.validate();
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      const response = await api.pentamont.api.tenants.post(tenantData.toJSON())
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to create tenant'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to create tenant')
      }
      return Tenant.fromJSON(response.data.data)
    },
    
    updateTenant: async (id: number, tenantData: UpdateTenant): Promise<Tenant> => {
      const errors = tenantData.validate();
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      const response = await api.pentamont.api.tenants({ id }).put(tenantData.toJSON())
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to update tenant'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update tenant')
      }
      return Tenant.fromJSON(response.data.data)
    },
    
    deleteTenant: async (id: number): Promise<void> => {
      const response = await api.pentamont.api.tenants({ id }).delete()
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


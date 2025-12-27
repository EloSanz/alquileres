import { useApi, checkAuthError } from '../contexts/ApiContext'
import { Property, CreateProperty, UpdateProperty } from '../../../shared/types/Property'

export const usePropertyService = () => {
  const api = useApi()
  
  return {
    getAllProperties: async (): Promise<Property[]> => {
      const response = await api.pentamont.api.properties.get()
      if (response.error) {
        // Verificar si es un error de autenticación y redirigir
        if (checkAuthError(response.error)) {
          throw new Error('Authentication required')
        }
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch properties'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch properties')
      }
      return response.data.data.map((item: any) => Property.fromJSON(item))
    },
    
    getPropertyById: async (id: number): Promise<Property> => {
      const response = await api.pentamont.api.properties({ id }).get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch property'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch property')
      }
      return Property.fromJSON(response.data.data)
    },
    
    createProperty: async (propertyData: CreateProperty): Promise<Property> => {
      const errors = propertyData.validate();
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      const response = await api.pentamont.api.properties.post(propertyData.toJSON())
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to create property'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to create property')
      }
      return Property.fromJSON(response.data.data)
    },
    
    updateProperty: async (id: number, propertyData: UpdateProperty): Promise<Property> => {
      const errors = propertyData.validate();
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      const response = await api.pentamont.api.properties({ id }).put(propertyData.toJSON())
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to update property'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update property')
      }
      return Property.fromJSON(response.data.data)
    },
    
    deleteProperty: async (id: number): Promise<void> => {
      const response = await api.pentamont.api.properties({ id }).delete()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to delete property'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to delete property')
      }
    },
    
    releaseProperty: async (id: number): Promise<Property> => {
      const response = await api.pentamont.api.properties({ id }).release.put()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to release property'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to release property')
      }
      return Property.fromJSON(response.data.data)
    }
  }
}

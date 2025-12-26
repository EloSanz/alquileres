import { useApi } from '../contexts/ApiContext'

// Types inferred from backend DTOs
export interface Property {
  id: number
  localNumber: number
  ubicacion: 'BOULEVARD' | 'SAN_MARTIN'
  propertyType: string
  monthlyRent: number
  bedrooms?: number | null
  bathrooms?: number | null
  areaSqm?: number | null
  description?: string | null
  zipCode?: string | null
  isAvailable?: boolean
  tenantId?: number | null
  tenant?: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreatePropertyData {
  localNumber: number
  ubicacion: 'BOULEVARD' | 'SAN_MARTIN'
  propertyType: string
  monthlyRent: number
  bedrooms?: number
  bathrooms?: number
  areaSqm?: number
  description?: string
  zipCode?: string
  isAvailable?: boolean
  tenantId: number
}

export interface UpdatePropertyData {
  localNumber?: number
  ubicacion?: 'BOULEVARD' | 'SAN_MARTIN'
  propertyType?: string
  monthlyRent?: number
  bedrooms?: number
  bathrooms?: number
  areaSqm?: number
  description?: string
  zipCode?: string
  isAvailable?: boolean
  status?: string
}

export const usePropertyService = () => {
  const api = useApi()
  
  return {
    getAllProperties: async (): Promise<Property[]> => {
      const response = await api.api.properties.get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch properties'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch properties')
      }
      return response.data.data as Property[]
    },
    
    getPropertyById: async (id: number): Promise<Property> => {
      const response = await api.api.properties({ id }).get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch property'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch property')
      }
      return response.data.data as Property
    },
    
    createProperty: async (propertyData: CreatePropertyData): Promise<Property> => {
      const response = await api.api.properties.post(propertyData)
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to create property'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to create property')
      }
      return response.data.data as Property
    },
    
    updateProperty: async (id: number, propertyData: UpdatePropertyData): Promise<Property> => {
      const response = await api.api.properties({ id }).put(propertyData)
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to update property'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update property')
      }
      return response.data.data as Property
    },
    
    deleteProperty: async (id: number): Promise<void> => {
      const response = await api.api.properties({ id }).delete()
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
      const response = await api.api.properties({ id }).release.put()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to release property'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to release property')
      }
      return response.data.data as Property
    }
  }
}

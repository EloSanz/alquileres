import { useApi } from '../contexts/ApiContext'

export interface Service {
  id: number
  propertyId: number | null
  contractId: number | null
  serviceType: string
  amount: number
  dueDate: string
  paidDate: string | null
  isPaid: boolean
  notes?: string | null
  createdAt: string
}

export interface CreateServiceData {
  propertyId: number | null
  contractId?: number | null
  serviceType: string
  amount: number
  dueDate: string
  paidDate?: string | null
  isPaid?: boolean
  notes?: string
}

export interface UpdateServiceData {
  propertyId?: number | null
  contractId?: number | null
  serviceType?: string
  amount?: number
  dueDate?: string
  paidDate?: string | null
  isPaid?: boolean
  notes?: string
}

export const useServiceService = () => {
  const api = useApi()
  
  return {
    getAllServices: async (): Promise<Service[]> => {
      const response = await api.pentamont.api.services.get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch services'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch services')
      }
      return response.data.data || []
    },
    
    getServiceById: async (id: number): Promise<Service> => {
      const response = await api.pentamont.api.services({ id }).get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch service'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch service')
      }
      return response.data.data
    },
    
    createService: async (serviceData: CreateServiceData): Promise<Service> => {
      const response = await api.pentamont.api.services.post(serviceData as any)
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to create service'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to create service')
      }
      return response.data.data
    },
    
    updateService: async (id: number, serviceData: UpdateServiceData): Promise<Service> => {
      const response = await api.pentamont.api.services({ id }).put(serviceData)
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to update service'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update service')
      }
      return response.data.data
    },
    
    deleteService: async (id: number): Promise<void> => {
      const response = await api.pentamont.api.services({ id }).delete()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to delete service'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to delete service')
      }
    }
  }
}


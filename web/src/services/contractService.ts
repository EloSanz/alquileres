import { useApi } from '../contexts/ApiContext'

export interface Contract {
  id: number
  tenantId: number | null
  propertyId: number | null
  tenantFullName?: string | null
  propertyName?: string | null
  startDate: string
  endDate: string
  monthlyRent: number
  status: string
  createdAt: string
  updatedAt: string
}

export interface CreateContractData {
  tenantId: number
  propertyId: number
  startDate: string
  monthlyRent: number
}

export interface UpdateContractData {
  tenantId?: number | null
  propertyId?: number | null
  startDate?: string
  monthlyRent?: number
  status?: string
}

export const useContractService = () => {
  const api = useApi()
  
  return {
    getAllContracts: async (): Promise<Contract[]> => {
      const response = await api.api.contracts.get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch contracts'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch contracts')
      }
      return response.data.data || []
    },
    
    getContractById: async (id: number): Promise<Contract> => {
      const response = await api.api.contracts({ id }).get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch contract'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch contract')
      }
      return response.data.data
    },
    
    getContractProgress: async (id: number) => {
      const response = await api.api.contracts({ id }).progress.get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch contract progress'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch contract progress')
      }
      return response.data.data
    },
    
    getActiveByTenant: async (tenantId: number): Promise<Contract | null> => {
      const response = await api.api.contracts.tenant({ tenantId }).active.get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch active contract'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch active contract')
      }
      return response.data.data
    },
    
    getActiveByProperty: async (propertyId: number): Promise<Contract | null> => {
      const response = await api.api.contracts.property({ propertyId }).active.get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch active contract'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch active contract')
      }
      return response.data.data
    },
    
    createContract: async (contractData: CreateContractData): Promise<Contract> => {
      const response = await api.api.contracts.post(contractData)
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to create contract'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to create contract')
      }
      return response.data.data
    },
    
    updateContract: async (id: number, contractData: UpdateContractData): Promise<Contract> => {
      const response = await api.api.contracts({ id }).put(contractData as any)
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to update contract'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update contract')
      }
      return response.data.data
    },
    
    deleteContract: async (id: number): Promise<void> => {
      const response = await api.api.contracts({ id }).delete()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to delete contract'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to delete contract')
      }
    }
  }
}

import { useApi } from '../contexts/ApiContext'
import { Contract, CreateContract, UpdateContract } from '../../../shared/types/Contract'

export const useContractService = () => {
  const api = useApi()
  
  return {
    getAllContracts: async (): Promise<Contract[]> => {
      const response = await api.pentamont.api.contracts.get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch contracts'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch contracts')
      }
      return (response.data.data || []).map((item: any) => Contract.fromJSON(item))
    },
    
    getContractById: async (id: number): Promise<Contract> => {
      const response = await api.pentamont.api.contracts({ id }).get()
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
      const response = await api.pentamont.api.contracts({ id }).progress.get()
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
      const response = await api.pentamont.api.contracts.tenant({ tenantId }).active.get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch active contract'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch active contract')
      }
      return response.data.data ? Contract.fromJSON(response.data.data) : null
    },
    
    getActiveByProperty: async (propertyId: number): Promise<Contract | null> => {
      const response = await api.pentamont.api.contracts.property({ propertyId }).active.get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch active contract'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch active contract')
      }
      return response.data.data ? Contract.fromJSON(response.data.data) : null
    },
    
    createContract: async (contractData: CreateContract): Promise<Contract> => {
      const errors = contractData.validate();
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      const response = await api.pentamont.api.contracts.post(contractData.toJSON())
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to create contract'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to create contract')
      }
      return Contract.fromJSON(response.data.data)
    },
    
    updateContract: async (id: number, contractData: UpdateContract): Promise<Contract> => {
      const errors = contractData.validate();
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      const response = await api.pentamont.api.contracts({ id }).put(contractData.toJSON())
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to update contract'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update contract')
      }
      return Contract.fromJSON(response.data.data)
    },
    
    deleteContract: async (id: number): Promise<void> => {
      const response = await api.pentamont.api.contracts({ id }).delete()
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

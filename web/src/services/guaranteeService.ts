import { useApi } from '../contexts/ApiContext';

export interface GuaranteeDTO {
  id: number;
  propertyId: number | null;
  contractId: number | null;
  tenantId: number | null;
  guaranteeType: string;
  amount: number;
  depositDate: string;
  returnDate: string | null;
  isReturned: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGuaranteeDTO {
  propertyId: number | null;
  contractId: number | null;
  tenantId: number | null;
  guaranteeType: string;
  amount: number;
  depositDate?: string;
  returnDate?: string | null;
  isReturned?: boolean;
  notes?: string;
}

export interface UpdateGuaranteeDTO {
  propertyId?: number | null;
  contractId?: number | null;
  tenantId?: number | null;
  guaranteeType?: string;
  amount?: number;
  depositDate?: string;
  returnDate?: string | null;
  isReturned?: boolean;
  notes?: string;
}

export const useGuaranteeService = () => {
  const api = useApi();

  return {
    getAllGuarantees: async (): Promise<GuaranteeDTO[]> => {
      const response = await api.api.guarantees.get();
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string'
          ? response.error.value
          : (response.error.value as any)?.message || 'Failed to fetch guarantees';
        throw new Error(errorMsg);
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch guarantees');
      }
      return response.data.data;
    },

    getGuaranteeById: async (id: number): Promise<GuaranteeDTO> => {
      const response = await api.api.guarantees({ id }).get();
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string'
          ? response.error.value
          : (response.error.value as any)?.message || 'Failed to fetch guarantee';
        throw new Error(errorMsg);
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch guarantee');
      }
      return response.data.data;
    },

    createGuarantee: async (data: CreateGuaranteeDTO): Promise<GuaranteeDTO> => {
      const response = await api.api.guarantees.post(data);
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string'
          ? response.error.value
          : (response.error.value as any)?.message || 'Failed to create guarantee';
        throw new Error(errorMsg);
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to create guarantee');
      }
      return response.data.data;
    },

    updateGuarantee: async (id: number, data: UpdateGuaranteeDTO): Promise<GuaranteeDTO> => {
      const response = await api.api.guarantees({ id }).put(data);
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string'
          ? response.error.value
          : (response.error.value as any)?.message || 'Failed to update guarantee';
        throw new Error(errorMsg);
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update guarantee');
      }
      return response.data.data;
    },

    deleteGuarantee: async (id: number): Promise<void> => {
      const response = await api.api.guarantees({ id }).delete();
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string'
          ? response.error.value
          : (response.error.value as any)?.message || 'Failed to delete guarantee';
        throw new Error(errorMsg);
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to delete guarantee');
      }
    }
  };
};

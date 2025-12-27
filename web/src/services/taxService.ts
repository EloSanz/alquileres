import { useApi } from '../contexts/ApiContext';

export interface TaxDTO {
  id: number;
  propertyId: number | null;
  contractId: number | null;
  taxType: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  isPaid: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaxDTO {
  propertyId: number | null;
  contractId: number | null;
  taxType: string;
  amount: number;
  dueDate: string;
  paidDate?: string | null;
  isPaid?: boolean;
  notes?: string;
}

export interface UpdateTaxDTO {
  propertyId?: number | null;
  contractId?: number | null;
  taxType?: string;
  amount?: number;
  dueDate?: string;
  paidDate?: string | null;
  isPaid?: boolean;
  notes?: string;
}

export const useTaxService = () => {
  const api = useApi();

  return {
    getAllTaxes: async (): Promise<TaxDTO[]> => {
      const response = await api.api.taxes.get();
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string'
          ? response.error.value
          : (response.error.value as any)?.message || 'Failed to fetch taxes';
        throw new Error(errorMsg);
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch taxes');
      }
      return response.data.data;
    },

    getTaxById: async (id: number): Promise<TaxDTO> => {
      const response = await api.api.taxes({ id }).get();
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string'
          ? response.error.value
          : (response.error.value as any)?.message || 'Failed to fetch tax';
        throw new Error(errorMsg);
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch tax');
      }
      return response.data.data;
    },

    createTax: async (data: CreateTaxDTO): Promise<TaxDTO> => {
      const response = await api.api.taxes.post(data);
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string'
          ? response.error.value
          : (response.error.value as any)?.message || 'Failed to create tax';
        throw new Error(errorMsg);
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to create tax');
      }
      return response.data.data;
    },

    updateTax: async (id: number, data: UpdateTaxDTO): Promise<TaxDTO> => {
      const response = await api.api.taxes({ id }).put(data);
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string'
          ? response.error.value
          : (response.error.value as any)?.message || 'Failed to update tax';
        throw new Error(errorMsg);
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update tax');
      }
      return response.data.data;
    },

    deleteTax: async (id: number): Promise<void> => {
      const response = await api.api.taxes({ id }).delete();
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string'
          ? response.error.value
          : (response.error.value as any)?.message || 'Failed to delete tax';
        throw new Error(errorMsg);
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to delete tax');
      }
    }
  };
};

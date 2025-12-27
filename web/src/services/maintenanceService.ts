import { useApi } from '../contexts/ApiContext';

export interface MaintenanceDTO {
  id: number;
  propertyId: number | null;
  contractId: number | null;
  maintenanceType: string;
  description: string;
  estimatedCost: number | null;
  actualCost: number | null;
  scheduledDate: string | null;
  completedDate: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenanceDTO {
  propertyId: number | null;
  contractId: number | null;
  maintenanceType: string;
  description: string;
  estimatedCost?: number | null;
  actualCost?: number | null;
  scheduledDate?: string | null;
  completedDate?: string | null;
  status?: string;
  notes?: string;
}

export interface UpdateMaintenanceDTO {
  propertyId?: number | null;
  contractId?: number | null;
  maintenanceType?: string;
  description?: string;
  estimatedCost?: number | null;
  actualCost?: number | null;
  scheduledDate?: string | null;
  completedDate?: string | null;
  status?: string;
  notes?: string;
}

export const useMaintenanceService = () => {
  const api = useApi();

  return {
    getAllMaintenances: async (): Promise<MaintenanceDTO[]> => {
      const response = await api.api.maintenances.get();
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string'
          ? response.error.value
          : (response.error.value as any)?.message || 'Failed to fetch maintenances';
        throw new Error(errorMsg);
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch maintenances');
      }
      return response.data.data;
    },

    getMaintenanceById: async (id: number): Promise<MaintenanceDTO> => {
      const response = await api.api.maintenances({ id }).get();
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string'
          ? response.error.value
          : (response.error.value as any)?.message || 'Failed to fetch maintenance';
        throw new Error(errorMsg);
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch maintenance');
      }
      return response.data.data;
    },

    createMaintenance: async (data: CreateMaintenanceDTO): Promise<MaintenanceDTO> => {
      const response = await api.api.maintenances.post(data);
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string'
          ? response.error.value
          : (response.error.value as any)?.message || 'Failed to create maintenance';
        throw new Error(errorMsg);
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to create maintenance');
      }
      return response.data.data;
    },

    updateMaintenance: async (id: number, data: UpdateMaintenanceDTO): Promise<MaintenanceDTO> => {
      const response = await api.api.maintenances({ id }).put(data);
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string'
          ? response.error.value
          : (response.error.value as any)?.message || 'Failed to update maintenance';
        throw new Error(errorMsg);
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update maintenance');
      }
      return response.data.data;
    },

    deleteMaintenance: async (id: number): Promise<void> => {
      const response = await api.api.maintenances({ id }).delete();
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string'
          ? response.error.value
          : (response.error.value as any)?.message || 'Failed to delete maintenance';
        throw new Error(errorMsg);
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to delete maintenance');
      }
    }
  };
};

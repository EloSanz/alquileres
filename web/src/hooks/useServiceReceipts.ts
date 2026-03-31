import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi, checkAuthError } from '../contexts/ApiContext';

export interface ServiceReceipt {
  id: number;
  categoryId: number;
  categoryName: string | null;
  categoryLabel: string | null;
  tenantId: number | null;
  tenantName: string | null;
  paymentDate: string;
  amount: number | null;
  receiptImageUrl: string | null;
  receiptImagePublicId: string | null;
  kind: 'GENERATED' | 'UPLOADED';
  notes: string | null;
  createdAt: string;
}

export interface CreateServiceReceipt {
  categoryId: number;
  tenantId?: number | null;
  tenantName?: string | null;
  paymentDate: string;
  amount?: number | null;
  receiptImageUrl?: string | null;
  receiptImagePublicId?: string | null;
  kind?: 'GENERATED' | 'UPLOADED';
  notes?: string | null;
}

const KEYS = { all: ['service-receipts'] as const };

export const useServiceReceipts = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const receiptsQuery = useQuery({
    queryKey: KEYS.all,
    queryFn: async () => {
      const response = await (api.api as any)['service-receipts'].get();
      if (response.error) {
        if (checkAuthError(response.error)) throw new Error('Authentication required');
        throw new Error((response.error.value as any)?.message || 'Failed to fetch service receipts');
      }
      return response.data.data as ServiceReceipt[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateServiceReceipt) => {
      const response = await (api.api as any)['service-receipts'].post(data);
      if (response.error) {
        throw new Error((response.error.value as any)?.message || 'Failed to create service receipt');
      }
      return response.data.data as ServiceReceipt;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
  });

  const updateImageMutation = useMutation({
    mutationFn: async ({ id, receiptImageUrl, receiptImagePublicId }: { id: number; receiptImageUrl: string; receiptImagePublicId?: string | null }) => {
      const response = await (api.api as any)['service-receipts']({ id }).image.patch({ receiptImageUrl, receiptImagePublicId });
      if (response.error) {
        throw new Error((response.error.value as any)?.message || 'Failed to update image');
      }
      return response.data.data as ServiceReceipt;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await (api.api as any)['service-receipts']({ id }).delete();
      if (response.error) {
        throw new Error((response.error.value as any)?.message || 'Failed to delete service receipt');
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (base64Image: string) => {
      const response = await api.api.media.upload.post({ image: base64Image });
      if (response.error) {
        throw new Error((response.error.value as any)?.message || 'Failed to upload image');
      }
      return response.data.data;
    },
  });

  return {
    receipts: receiptsQuery.data || [],
    isLoading: receiptsQuery.isLoading,
    error: receiptsQuery.error,
    createReceipt: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateImage: updateImageMutation.mutateAsync,
    isUpdatingImage: updateImageMutation.isPending,
    deleteReceipt: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    uploadImage: uploadImageMutation.mutateAsync,
    isUploading: uploadImageMutation.isPending,
  };
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi, checkAuthError } from '../contexts/ApiContext';
import { Contract, CreateContract, UpdateContract } from '../../../shared/types/Contract';

// Keys for cache invalidation
const CONTRACT_KEYS = {
    all: ['contracts'] as const,
    detail: (id: number) => ['contracts', id] as const,
    activeByTenant: (tenantId: number) => ['contracts', 'active', 'tenant', tenantId] as const,
    activeByProperty: (propertyId: number) => ['contracts', 'active', 'property', propertyId] as const,
};

export const useContracts = () => {
    const api = useApi();
    const queryClient = useQueryClient();

    const contractsQuery = useQuery({
        queryKey: CONTRACT_KEYS.all,
        queryFn: async () => {
            const response = await api.pentamont.api.contracts.get();

            if (response.error) {
                if (checkAuthError(response.error)) throw new Error('Authentication required');
                const errorMsg = typeof response.error.value === 'string'
                    ? response.error.value
                    : (response.error.value as any)?.message || 'Failed to fetch contracts';
                throw new Error(errorMsg);
            }

            return response.data.data as Contract[];
        }
    });

    const createContractMutation = useMutation({
        mutationFn: async (newContract: CreateContract) => {
            const response = await api.pentamont.api.contracts.post(newContract);

            if (response.error) {
                const errorMsg = typeof response.error.value === 'string'
                    ? response.error.value
                    : (response.error.value as any)?.message || 'Failed to create contract';
                throw new Error(errorMsg);
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.all });
        }
    });

    const updateContractMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateContract }) => {
            const response = await api.pentamont.api.contracts({ id }).put(data as any);

            if (response.error) {
                const errorMsg = typeof response.error.value === 'string'
                    ? response.error.value
                    : (response.error.value as any)?.message || 'Failed to update contract';
                throw new Error(errorMsg);
            }

            return response.data.data;
        },
        onSuccess: (updatedContract) => {
            queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.all });
            queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.detail(updatedContract.id) });
        }
    });

    const deleteContractMutation = useMutation({
        mutationFn: async (id: number) => {
            const response = await api.pentamont.api.contracts({ id }).delete();

            if (response.error) {
                const errorMsg = typeof response.error.value === 'string'
                    ? response.error.value
                    : (response.error.value as any)?.message || 'Failed to delete contract';
                throw new Error(errorMsg);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.all });
        }
    });

    return {
        contracts: contractsQuery.data || [],
        isLoading: contractsQuery.isLoading,
        error: contractsQuery.error,
        refetch: contractsQuery.refetch,
        createContract: createContractMutation.mutateAsync,
        updateContract: updateContractMutation.mutateAsync,
        deleteContract: deleteContractMutation.mutateAsync,
        isCreating: createContractMutation.isPending,
        isUpdating: updateContractMutation.isPending,
        isDeleting: deleteContractMutation.isPending,
    };
};

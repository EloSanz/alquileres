import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi, checkAuthError } from '../contexts/ApiContext';
import { Tenant, CreateTenant, UpdateTenant } from '../../../shared/types/Tenant';

// Keys for cache invalidation
const TENANT_KEYS = {
    all: ['tenants'] as const,
    detail: (id: number) => ['tenants', id] as const,
};

export const useTenants = () => {
    const api = useApi();
    const queryClient = useQueryClient();

    const tenantsQuery = useQuery({
        queryKey: TENANT_KEYS.all,
        queryFn: async () => {
            const response = await api.api.tenants.get();

            if (response.error) {
                if (checkAuthError(response.error)) throw new Error('Authentication required');
                const errorMsg = typeof response.error.value === 'string'
                    ? response.error.value
                    : (response.error.value as any)?.message || 'Failed to fetch tenants';
                throw new Error(errorMsg);
            }

            return response.data.data as Tenant[];
        }
    });

    const createTenantMutation = useMutation({
        mutationFn: async (newTenant: CreateTenant) => {
            const response = await api.api.tenants.post(newTenant);

            if (response.error) {
                const errorMsg = typeof response.error.value === 'string'
                    ? response.error.value
                    : (response.error.value as any)?.message || 'Failed to create tenant';
                throw new Error(errorMsg);
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TENANT_KEYS.all });
        }
    });

    const updateTenantMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateTenant }) => {
            const response = await api.api.tenants({ id }).put(data);

            if (response.error) {
                const errorMsg = typeof response.error.value === 'string'
                    ? response.error.value
                    : (response.error.value as any)?.message || 'Failed to update tenant';
                throw new Error(errorMsg);
            }

            return response.data.data;
        },
        onSuccess: (updatedTenant) => {
            queryClient.invalidateQueries({ queryKey: TENANT_KEYS.all });
            queryClient.invalidateQueries({ queryKey: TENANT_KEYS.detail(updatedTenant.id) });
        }
    });

    const deleteTenantMutation = useMutation({
        mutationFn: async (id: number) => {
            const response = await api.api.tenants({ id }).delete();

            if (response.error) {
                const errorMsg = typeof response.error.value === 'string'
                    ? response.error.value
                    : (response.error.value as any)?.message || 'Failed to delete tenant';
                // Handle specific error code
                if ((response.error.value as any)?.code === 'TENANT_HAS_PROPERTIES') {
                    const customError = new Error((response.error.value as any).message);
                    (customError as any).code = 'TENANT_HAS_PROPERTIES';
                    throw customError;
                }
                throw new Error(errorMsg);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TENANT_KEYS.all });
        }
    });

    return {
        tenants: tenantsQuery.data || [],
        isLoading: tenantsQuery.isLoading,
        error: tenantsQuery.error,
        refetch: tenantsQuery.refetch,
        createTenant: createTenantMutation.mutateAsync,
        updateTenant: updateTenantMutation.mutateAsync,
        deleteTenant: deleteTenantMutation.mutateAsync,
        isCreating: createTenantMutation.isPending,
        isUpdating: updateTenantMutation.isPending,
        isDeleting: deleteTenantMutation.isPending,
    };
};

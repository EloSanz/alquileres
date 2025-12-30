import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi, checkAuthError } from '../contexts/ApiContext';
import { Property, CreateProperty, UpdateProperty } from '../../../shared/types/Property';

// Keys for cache invalidation
const PROPERTY_KEYS = {
    all: ['properties'] as const,
    detail: (id: number) => ['properties', id] as const,
};

export const useProperties = () => {
    const api = useApi();
    const queryClient = useQueryClient();

    const propertiesQuery = useQuery({
        queryKey: PROPERTY_KEYS.all,
        queryFn: async () => {
            const response = await api.pentamont.api.properties.get();

            if (response.error) {
                if (checkAuthError(response.error)) throw new Error('Authentication required');
                const errorMsg = typeof response.error.value === 'string'
                    ? response.error.value
                    : (response.error.value as any)?.message || 'Failed to fetch properties';
                throw new Error(errorMsg);
            }

            if (!response.data?.success) {
                throw new Error(response.data?.message || 'Failed to fetch properties');
            }

            return response.data.data as Property[];
        }
    });

    const createPropertyMutation = useMutation({
        mutationFn: async (newProperty: CreateProperty) => {
            const response = await api.pentamont.api.properties.post(newProperty);

            if (response.error) {
                const errorMsg = typeof response.error.value === 'string'
                    ? response.error.value
                    : (response.error.value as any)?.message || 'Failed to create property';
                throw new Error(errorMsg);
            }

            if (!response.data?.success) {
                throw new Error(response.data?.message || 'Failed to create property');
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.all });
        }
    });

    const updatePropertyMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateProperty }) => {
            const response = await api.pentamont.api.properties({ id }).put(data);

            if (response.error) {
                const errorMsg = typeof response.error.value === 'string'
                    ? response.error.value
                    : (response.error.value as any)?.message || 'Failed to update property';
                throw new Error(errorMsg);
            }

            if (!response.data?.success) {
                throw new Error(response.data?.message || 'Failed to update property');
            }

            return response.data.data;
        },
        onSuccess: (updatedProperty) => {
            queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.all });
            queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.detail(updatedProperty.id) });
        }
    });

    const deletePropertyMutation = useMutation({
        mutationFn: async (id: number) => {
            const response = await api.pentamont.api.properties({ id }).delete();

            if (response.error) {
                const errorMsg = typeof response.error.value === 'string'
                    ? response.error.value
                    : (response.error.value as any)?.message || 'Failed to delete property';
                throw new Error(errorMsg);
            }

            if (!response.data?.success) {
                throw new Error(response.data?.message || 'Failed to delete property');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.all });
        }
    });

    return {
        properties: propertiesQuery.data || [],
        isLoading: propertiesQuery.isLoading,
        error: propertiesQuery.error,
        refetch: propertiesQuery.refetch,
        createProperty: createPropertyMutation.mutateAsync,
        updateProperty: updatePropertyMutation.mutateAsync,
        deleteProperty: deletePropertyMutation.mutateAsync,
        isCreating: createPropertyMutation.isPending,
        isUpdating: updatePropertyMutation.isPending,
        isDeleting: deletePropertyMutation.isPending,
    };
};

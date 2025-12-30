import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi, checkAuthError } from '../contexts/ApiContext';
import { Payment, CreatePayment, UpdatePayment } from '../../../shared/types/Payment';

// Keys for cache invalidation
const PAYMENT_KEYS = {
    all: ['payments'] as const,
    detail: (id: number) => ['payments', id] as const,
    byTenant: (tenantId: number) => ['payments', 'tenant', tenantId] as const,
};

export const usePayments = () => {
    const api = useApi();
    const queryClient = useQueryClient();

    const paymentsQuery = useQuery({
        queryKey: PAYMENT_KEYS.all,
        queryFn: async () => {
            const response = await api.api.payments.get();

            if (response.error) {
                if (checkAuthError(response.error)) throw new Error('Authentication required');
                const errorMsg = typeof response.error.value === 'string'
                    ? response.error.value
                    : (response.error.value as any)?.message || 'Failed to fetch payments';
                throw new Error(errorMsg);
            }

            return response.data.data as Payment[];
        }
    });

    const createPaymentMutation = useMutation({
        mutationFn: async (newPayment: CreatePayment) => {
            const response = await api.api.payments.post(newPayment as any);

            if (response.error) {
                const errorMsg = typeof response.error.value === 'string'
                    ? response.error.value
                    : (response.error.value as any)?.message || 'Failed to create payment';
                throw new Error(errorMsg);
            }

            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
        }
    });

    const updatePaymentMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdatePayment }) => {
            const response = await api.api.payments({ id }).put(data);

            if (response.error) {
                const errorMsg = typeof response.error.value === 'string'
                    ? response.error.value
                    : (response.error.value as any)?.message || 'Failed to update payment';
                throw new Error(errorMsg);
            }

            return response.data.data;
        },
        onSuccess: (updatedPayment) => {
            queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
            queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.detail(updatedPayment.id) });
        }
    });

    const deletePaymentMutation = useMutation({
        mutationFn: async (id: number) => {
            const response = await api.api.payments({ id }).delete();

            if (response.error) {
                const errorMsg = typeof response.error.value === 'string'
                    ? response.error.value
                    : (response.error.value as any)?.message || 'Failed to delete payment';
                throw new Error(errorMsg);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
        }
    });

    return {
        payments: paymentsQuery.data || [],
        isLoading: paymentsQuery.isLoading,
        error: paymentsQuery.error,
        refetch: paymentsQuery.refetch,
        createPayment: createPaymentMutation.mutateAsync,
        updatePayment: updatePaymentMutation.mutateAsync,
        deletePayment: deletePaymentMutation.mutateAsync,
        isCreating: createPaymentMutation.isPending,
        isUpdating: updatePaymentMutation.isPending,
        isDeleting: deletePaymentMutation.isPending,
    };
};

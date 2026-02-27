import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PatioPayment, CreatePatioPayment, UpdatePatioPayment } from '../../../shared/types/PatioPayment';

// Misma lógica que ApiContext: usa window.location.origin + VITE_API_SCOPE
// En local: http://localhost:4001/pentamont → proxy Vite → http://localhost:4000
// En prod: https://icards.fun/pentamont → Nginx → backend
const getApiBase = () => {
    const apiScope = import.meta.env.VITE_API_SCOPE || '/pentamont';
    return new URL(apiScope, window.location.origin).toString().replace(/\/$/, '');
};

const PATIO_PAYMENT_KEYS = {
    all: ['patio-payments'] as const,
    detail: (id: number) => ['patio-payments', id] as const,
};

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('pentamont_token');
    const cleanToken = token ? String(token).trim().replace(/^[\"']|[\"']$/g, '') : null;
    const isValidToken = cleanToken && cleanToken.split('.').length === 3;

    console.log('[usePatioPayments] fetch', url);

    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(isValidToken ? { Authorization: `Bearer ${cleanToken}` } : {}),
            ...options?.headers,
        },
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = (data as any)?.message || `Error ${res.status}`;
        console.error('[usePatioPayments] error:', msg);
        throw new Error(msg);
    }

    const data = await res.json();
    return data.data as T;
}

export const usePatioPayments = () => {
    const queryClient = useQueryClient();
    const API_BASE = getApiBase();

    const paymentsQuery = useQuery({
        queryKey: PATIO_PAYMENT_KEYS.all,
        queryFn: () => apiFetch<PatioPayment[]>(`${API_BASE}/api/patio-payments`),
        retry: false,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreatePatioPayment) =>
            apiFetch<PatioPayment>(`${API_BASE}/api/patio-payments`, {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: PATIO_PAYMENT_KEYS.all }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdatePatioPayment }) =>
            apiFetch<PatioPayment>(`${API_BASE}/api/patio-payments/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: PATIO_PAYMENT_KEYS.all }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) =>
            apiFetch<void>(`${API_BASE}/api/patio-payments/${id}`, { method: 'DELETE' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: PATIO_PAYMENT_KEYS.all }),
    });

    const uploadImageMutation = useMutation({
        mutationFn: async (base64Image: string) => {
            const res = await fetch(`${API_BASE}/api/media/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('pentamont_token')?.replace(/^[\"']|[\"']$/g, '')}`,
                },
                body: JSON.stringify({ image: base64Image }),
            });

            if (!res.ok) {
                throw new Error('Failed to upload image');
            }

            const data = await res.json();
            return data.data; // { url: string, publicId: string }
        },
    });

    return {
        patioPayments: paymentsQuery.data || [],
        isLoading: paymentsQuery.isLoading,
        error: paymentsQuery.error,
        createPatioPayment: createMutation.mutateAsync,
        updatePatioPayment: updateMutation.mutateAsync,
        deletePatioPayment: deleteMutation.mutateAsync,
        uploadImage: uploadImageMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isUploading: uploadImageMutation.isPending,
    };
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PatioTenant, CreatePatioTenant, UpdatePatioTenant } from '../../../shared/types/PatioTenant';

// Misma lógica que ApiContext: usa window.location.origin + VITE_API_SCOPE
// En local: http://localhost:4001/pentamont → proxy Vite → http://localhost:4000
// En prod: https://icards.fun/pentamont → Nginx → backend
const getApiBase = () => {
    const apiScope = import.meta.env.VITE_API_SCOPE || '/pentamont';
    return new URL(apiScope, window.location.origin).toString().replace(/\/$/, '');
};

const PATIO_TENANT_KEYS = {
    all: ['patio-tenants'] as const,
    detail: (id: number) => ['patio-tenants', id] as const,
};

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('pentamont_token');
    const cleanToken = token ? String(token).trim().replace(/^[\"']|[\"']$/g, '') : null;
    const isValidToken = cleanToken && cleanToken.split('.').length === 3;

    console.log('[usePatioTenants] fetch', url);

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
        console.error('[usePatioTenants] error:', msg);
        throw new Error(msg);
    }

    const data = await res.json();
    return data.data as T;
}

export const usePatioTenants = () => {
    const queryClient = useQueryClient();
    const API_BASE = getApiBase();

    const tenantsQuery = useQuery({
        queryKey: PATIO_TENANT_KEYS.all,
        queryFn: () => apiFetch<PatioTenant[]>(`${API_BASE}/api/patio-tenants`),
        retry: false,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreatePatioTenant) =>
            apiFetch<PatioTenant>(`${API_BASE}/api/patio-tenants`, {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: PATIO_TENANT_KEYS.all }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdatePatioTenant }) =>
            apiFetch<PatioTenant>(`${API_BASE}/api/patio-tenants/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: PATIO_TENANT_KEYS.all }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) =>
            apiFetch<void>(`${API_BASE}/api/patio-tenants/${id}`, { method: 'DELETE' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: PATIO_TENANT_KEYS.all }),
    });

    return {
        patioTenants: tenantsQuery.data || [],
        isLoading: tenantsQuery.isLoading,
        error: tenantsQuery.error,
        createPatioTenant: createMutation.mutateAsync,
        updatePatioTenant: updateMutation.mutateAsync,
        deletePatioTenant: deleteMutation.mutateAsync,
    };
};

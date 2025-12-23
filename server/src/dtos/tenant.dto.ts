export interface TenantDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  documentId: string;
  address: string | null;
  birthDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  documentId: string;
  address?: string;
  birthDate?: string;
}

export interface UpdateTenantDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
}

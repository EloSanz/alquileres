import { Rubro } from "@prisma/client";

export interface TenantDTO {
  id: number;
  firstName: string;
  lastName: string;
  phone: string | null;
  documentId: string;
  address: string | null;
  birthDate: string | null;
  numeroLocal: number | null;
  rubro: Rubro | null; // Se mantiene como string en DTO para compatibilidad con frontend
  fechaInicioContrato: string | null;
  estadoPago: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantDTO {
  firstName: string;
  lastName: string;
  phone?: string;
  documentId: string;
  address?: string;
  birthDate?: string;
  numeroLocal?: number;
  rubro?: string;
  fechaInicioContrato?: string;
}

export interface UpdateTenantDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  numeroLocal?: number;
  rubro?: string;
  fechaInicioContrato?: string;
}

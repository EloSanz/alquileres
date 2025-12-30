import { z } from 'zod';

export const TenantSchema = z.object({
  id: z.number(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().nullable().optional(),
  documentId: z.string().min(5, 'Document ID must be at least 5 characters'),
  numeroLocal: z.string().nullable().optional(),
  rubro: z.string().nullable().optional(),
  fechaInicioContrato: z.string().nullable().optional(),
  estadoPago: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  localNumbers: z.array(z.number()).optional()
});

export type Tenant = z.infer<typeof TenantSchema>;

export const CreateTenantSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  documentId: z.string().min(5, 'Document ID must be at least 5 characters'),
  phone: z.string().optional(),
  numeroLocal: z.string().optional(),
  rubro: z.string().optional(),
  fechaInicioContrato: z.string().optional()
});

export type CreateTenant = z.infer<typeof CreateTenantSchema>;

export const UpdateTenantSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  documentId: z.string().min(5, 'Document ID must be at least 5 characters').optional(),
  numeroLocal: z.string().optional(),
  rubro: z.string().optional(),
  fechaInicioContrato: z.string().optional(),
  estadoPago: z.string().optional()
});

export type UpdateTenant = z.infer<typeof UpdateTenantSchema>;

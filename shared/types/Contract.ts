import { z } from 'zod';

export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  TERMINATED = 'TERMINATED',
}

export const ContractSchema = z.object({
  id: z.number(),
  tenantId: z.number().nullable(),
  propertyId: z.number().nullable(),
  tenantFullName: z.string().nullable(),
  propertyName: z.string().nullable(),
  propertyLocalNumber: z.number().nullable(),
  // Dates can come as strings (ISO) or Date objects, handling both
  startDate: z.union([z.string(), z.date()]),
  endDate: z.union([z.string(), z.date()]),
  monthlyRent: z.number().positive('Monthly rent must be greater than 0'),
  status: z.union([z.nativeEnum(ContractStatus), z.string()]),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type Contract = z.infer<typeof ContractSchema>;

export const CreateContractSchema = z.object({
  tenantId: z.number().int().positive('Tenant ID is required'),
  propertyId: z.number().int().positive('Property ID is required'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Start date is invalid' }),
  monthlyRent: z.number().positive('Monthly rent must be greater than 0'),
  endDate: z.string().optional()
});

export type CreateContract = z.infer<typeof CreateContractSchema>;

export const UpdateContractSchema = z.object({
  tenantId: z.number().nullable().optional(),
  propertyId: z.number().nullable().optional(),
  startDate: z.string().optional(),
  monthlyRent: z.number().positive('Monthly rent must be greater than 0').optional(),
  status: z.union([z.nativeEnum(ContractStatus), z.string()]).optional()
});

export type UpdateContract = z.infer<typeof UpdateContractSchema>;

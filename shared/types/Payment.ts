import { z } from 'zod';

export enum PaymentStatus {
  PAGADO = 'PAGADO',
  VENCIDO = 'VENCIDO',
  FUTURO = 'FUTURO'
}

export const PaymentSchema = z.object({
  id: z.number(),
  tenantId: z.number().nullable(),
  propertyId: z.number().nullable(),
  contractId: z.number().nullable(),
  monthNumber: z.number().nullable(),
  tenantFullName: z.string().nullable(),
  tenantPhone: z.string().nullable(),
  amount: z.number(),
  // Dates can come as strings (ISO) or Date objects
  paymentDate: z.string(),
  dueDate: z.string(),
  // Allow any string for paymentMethod but common ones are YAPE, DEPOSITO, etc.
  paymentMethod: z.string(),
  status: z.nativeEnum(PaymentStatus),
  pentamontSettled: z.boolean(),
  notes: z.string().nullable(),
  receiptImageUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type Payment = z.infer<typeof PaymentSchema>;

export const CreatePaymentSchema = z.object({
  tenantId: z.number().int().positive('Tenant ID is required'),
  propertyId: z.number().nullable().optional(),
  amount: z.number().positive('Amount must be greater than 0'),
  dueDate: z.string().min(1, 'Due date is required'),
  paymentDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  pentamontSettled: z.boolean().optional(),
  notes: z.string().optional()
});

export type CreatePayment = z.infer<typeof CreatePaymentSchema>;

export const UpdatePaymentSchema = z.object({
  tenantId: z.number().nullable().optional(),
  propertyId: z.number().nullable().optional(),
  contractId: z.number().nullable().optional(),
  monthNumber: z.number().nullable().optional(),
  tenantFullName: z.string().nullable().optional(),
  tenantPhone: z.string().nullable().optional(),
  amount: z.number().positive('Amount must be greater than 0').optional(),
  paymentDate: z.string().optional(),
  dueDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  pentamontSettled: z.boolean().optional(),
  notes: z.string().optional(),
  receiptImageUrl: z.string().nullable().optional()
});

export type UpdatePayment = z.infer<typeof UpdatePaymentSchema>;

import { z } from 'zod';

export const PropertySchema = z.object({
  id: z.number(),
  localNumber: z.number().gt(0, 'Local number must be greater than 0'),
  ubicacion: z.union([
    z.literal('BOULEVAR'),
    z.literal('SAN_MARTIN'),
    z.literal('PATIO')
  ]),
  monthlyRent: z.number().gt(0, 'Monthly rent must be greater than 0'),
  status: z.string(),
  tenantId: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  tenant: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string()
  }).optional()
});

export type Property = z.infer<typeof PropertySchema>;

export const CreatePropertySchema = z.object({
  localNumber: z.number().gt(0, 'Local number must be greater than 0'),
  ubicacion: z.union([
    z.literal('BOULEVAR'),
    z.literal('SAN_MARTIN'),
    z.literal('PATIO')
  ]),
  monthlyRent: z.number().gt(0, 'Monthly rent must be greater than 0'),
  tenantId: z.number().nullable()
});

export type CreateProperty = z.infer<typeof CreatePropertySchema>;

export const UpdatePropertySchema = z.object({
  localNumber: z.number().gt(0, 'Local number must be greater than 0').optional(),
  ubicacion: z.union([
    z.literal('BOULEVAR'),
    z.literal('SAN_MARTIN'),
    z.literal('PATIO')
  ]).optional(),
  monthlyRent: z.number().gt(0, 'Monthly rent must be greater than 0').optional()
});

export type UpdateProperty = z.infer<typeof UpdatePropertySchema>;

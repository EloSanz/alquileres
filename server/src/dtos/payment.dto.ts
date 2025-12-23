export interface PaymentDTO {
  id: number;
  tenantId: number;
  propertyId: number;
  amount: number;
  paymentDate: string;
  dueDate: string;
  paymentType: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDTO {
  tenantId: number;
  propertyId: number;
  amount: number;
  paymentDate?: string;
  dueDate: string;
  paymentType: string;
  status?: string;
  notes?: string;
}

export interface UpdatePaymentDTO {
  tenantId?: number;
  propertyId?: number;
  amount?: number;
  paymentDate?: string;
  dueDate?: string;
  paymentType?: string;
  status?: string;
  notes?: string;
}

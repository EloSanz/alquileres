export interface PaymentDTO {
  id: number;
  tenantId: number | null;
  propertyId: number;
  contractId: number | null;
  monthNumber: number | null;
  tenantFullName: string | null;
  tenantPhone: string | null;
  amount: number;
  paymentDate: string;
  dueDate: string;
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
  notes?: string;
}

export interface UpdatePaymentDTO {
  tenantId?: number | null;
  propertyId?: number;
  contractId?: number | null;
  monthNumber?: number | null;
  tenantFullName?: string | null;
  tenantPhone?: string | null;
  amount?: number;
  paymentDate?: string;
  dueDate?: string;
  notes?: string;
}

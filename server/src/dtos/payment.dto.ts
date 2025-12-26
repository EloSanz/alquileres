export interface PaymentDTO {
  id: number;
  tenantId: number | null;
  propertyId: number | null;
  contractId: number | null;
  monthNumber: number | null;
  tenantFullName: string | null;
  tenantPhone: string | null;
  amount: number;
  paymentDate: string;
  dueDate: string;
  paymentMethod: string;
  pentamontSettled: boolean;
  notes: string | null;
  receiptImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDTO {
  tenantId: number;
  propertyId: number | null;
  amount: number;
  paymentDate?: string;
  dueDate: string;
  paymentMethod?: string;
  pentamontSettled?: boolean;
  notes?: string;
}

export interface UpdatePaymentDTO {
  tenantId?: number | null;
  propertyId?: number | null;
  contractId?: number | null;
  monthNumber?: number | null;
  tenantFullName?: string | null;
  tenantPhone?: string | null;
  amount?: number;
  paymentDate?: string;
  dueDate?: string;
  paymentMethod?: string;
  pentamontSettled?: boolean;
  notes?: string;
}

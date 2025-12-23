export interface PaymentDTO {
  id: number;
  rentalId: number;
  amount: number;
  paymentDate: string;
  dueDate: string;
  paymentType: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDTO {
  rentalId: number;
  amount: number;
  paymentDate?: string;
  dueDate: string;
  paymentType: string;
  status?: string;
  notes?: string;
}

export interface UpdatePaymentDTO {
  rentalId?: number;
  amount?: number;
  paymentDate?: string;
  dueDate?: string;
  paymentType?: string;
  status?: string;
  notes?: string;
}

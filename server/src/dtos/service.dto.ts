export interface ServiceDTO {
  id: number;
  propertyId: number | null;
  contractId: number | null;
  serviceType: string; // 'AGUA' | 'LUZ' | 'ARBITRIOS'
  amount: number;
  dueDate: string;
  paidDate: string | null;
  isPaid: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDTO {
  propertyId: number | null;
  contractId: number | null;
  serviceType: string;
  amount: number;
  dueDate: string;
  paidDate?: string | null;
  isPaid?: boolean;
  notes?: string;
}

export interface UpdateServiceDTO {
  propertyId?: number | null;
  contractId?: number | null;
  serviceType?: string;
  amount?: number;
  dueDate?: string;
  paidDate?: string | null;
  isPaid?: boolean;
  notes?: string;
}


export interface RentalDTO {
  id: number;
  tenantId: number;
  propertyId: number;
  startDate: string;
  endDate: string | null;
  monthlyRent: number;
  depositAmount: number | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  tenant?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  property?: {
    id: number;
    name: string;
    address: string;
  };
}

export interface CreateRentalDTO {
  tenantId: number;
  propertyId: number;
  startDate: string;
  endDate?: string;
  monthlyRent: number;
  depositAmount?: number;
  status?: string;
  notes?: string;
}

export interface UpdateRentalDTO {
  tenantId?: number;
  propertyId?: number;
  startDate?: string;
  endDate?: string;
  monthlyRent?: number;
  depositAmount?: number;
  status?: string;
  notes?: string;
}

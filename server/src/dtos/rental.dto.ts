export interface RentalDTO {
  id: number;
  tenantId: number;
  propertyId: number;
  startDate: string;
  endDate?: string;
  monthlyRent: number;
  depositAmount?: number;
  status: string;
  notes?: string;
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

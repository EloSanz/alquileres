export interface PropertyDTO {
  id: number;
  localNumber: number;
  ubicacion: string;
  propertyType: string;
  monthlyRent: number;
  isAvailable: boolean;
  status: string;
  tenantId: number | null;
  tenant?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyDTO {
  localNumber: number;
  ubicacion: string;
  propertyType: string;
  monthlyRent: number;
  isAvailable?: boolean;
  tenantId: number | null;
}

export interface UpdatePropertyDTO {
  localNumber?: number;
  ubicacion?: string;
  propertyType?: string;
  monthlyRent?: number;
  isAvailable?: boolean;
}

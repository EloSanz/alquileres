export interface PropertyDTO {
  id: number;
  localNumber: number;
  ubicacion: string;
  zipCode: string | null;
  propertyType: string;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number | null;
  monthlyRent: number;
  description: string | null;
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
  zipCode?: string;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  monthlyRent: number;
  description?: string;
  isAvailable?: boolean;
  tenantId: number | null;
}

export interface UpdatePropertyDTO {
  localNumber?: number;
  ubicacion?: string;
  zipCode?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  monthlyRent?: number;
  description?: string;
  isAvailable?: boolean;
}

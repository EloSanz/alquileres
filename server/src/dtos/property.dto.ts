export interface PropertyDTO {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string | null;
  propertyType: string;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number | null;
  monthlyRent: number;
  description: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyDTO {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  monthlyRent: number;
  description?: string;
  isAvailable?: boolean;
}

export interface UpdatePropertyDTO {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  monthlyRent?: number;
  description?: string;
  isAvailable?: boolean;
}

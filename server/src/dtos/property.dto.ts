export interface PropertyDTO {
  id: number;
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

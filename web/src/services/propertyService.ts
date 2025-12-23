interface Property {
  id: number;
  title: string;
  description: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface CreatePropertyData {
  title: string;
  description: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
}

interface UpdatePropertyData extends Partial<CreatePropertyData> {
  status?: string;
}

class PropertyService {
  private baseUrl = '/api';

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getAllProperties(): Promise<Property[]> {
    const response = await fetch(`${this.baseUrl}/properties`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch properties');
    }

    return data.data;
  }

  async getPropertyById(id: number): Promise<Property> {
    const response = await fetch(`${this.baseUrl}/properties/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch property');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch property');
    }

    return data.data;
  }

  async createProperty(propertyData: CreatePropertyData): Promise<Property> {
    const response = await fetch(`${this.baseUrl}/properties`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      throw new Error('Failed to create property');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to create property');
    }

    return data.data;
  }

  async updateProperty(id: number, propertyData: UpdatePropertyData): Promise<Property> {
    const response = await fetch(`${this.baseUrl}/properties/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      throw new Error('Failed to update property');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to update property');
    }

    return data.data;
  }

  async deleteProperty(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/properties/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete property');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete property');
    }
  }
}

export const propertyService = new PropertyService();
export type { Property, CreatePropertyData, UpdatePropertyData };

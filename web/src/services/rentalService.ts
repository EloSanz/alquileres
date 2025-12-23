interface Rental {
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
  // Joined data for display
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
    city: string;
    state: string;
  };
}

class RentalService {
  private baseUrl = '/api';

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getAllRentals(): Promise<Rental[]> {
    const response = await fetch(`${this.baseUrl}/rentals`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch rentals');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch rentals');
    }

    return data.data || [];
  }

  async getRentalById(id: number): Promise<Rental> {
    const response = await fetch(`${this.baseUrl}/rentals/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch rental');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch rental');
    }

    return data.data;
  }
}

export const rentalService = new RentalService();
export type { Rental };

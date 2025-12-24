interface Contract {
  id: number;
  tenantId: number;
  propertyId: number;
  tenantFullName?: string;
  propertyName?: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

class ContractService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getAllContracts(): Promise<Contract[]> {
    const response = await fetch('/api/contracts', {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch contracts');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch contracts');
    }

    return data.data || [];
  }

  async getContractById(id: number): Promise<Contract> {
    const response = await fetch(`/api/contracts/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch contract');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch contract');
    }

    return data.data;
  }

  async createContract(contractData: {
    tenantId: number;
    propertyId: number;
    startDate: string;
    monthlyRent: number;
  }): Promise<Contract> {
    const response = await fetch('/api/contracts', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(contractData),
    });

    if (!response.ok) {
      throw new Error('Failed to create contract');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to create contract');
    }

    return data.data;
  }

  async updateContract(id: number, contractData: Partial<Contract>): Promise<Contract> {
    const response = await fetch(`/api/contracts/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(contractData),
    });

    if (!response.ok) {
      throw new Error('Failed to update contract');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to update contract');
    }

    return data.data;
  }

  async deleteContract(id: number): Promise<void> {
    const response = await fetch(`/api/contracts/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete contract');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete contract');
    }
  }
}

export const contractService = new ContractService();
export type { Contract };


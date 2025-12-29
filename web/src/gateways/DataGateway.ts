import { Tenant } from '../../../shared/types/Tenant';
import { Property } from '../../../shared/types/Property';
import { Contract } from '../../../shared/types/Contract';
import { Payment } from '../../../shared/types/Payment';
import { useApi } from '../contexts/ApiContext';

export class DataGateway {
  private tenants: Tenant[] = [];
  private properties: Property[] = [];
  private contracts: Contract[] = [];
  private payments: Payment[] = [];
  private loaded = false;
  private loading = false;
  private loadPromise: Promise<void> | null = null;
  private listeners = new Set<() => void>();

  constructor(private api: ReturnType<typeof useApi>) {}

  onChange(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify(): void {
    for (const cb of this.listeners) {
      try {
        cb();
      } catch {
        // Evitar que un error de un listener afecte a otros
      }
    }
  }

  async loadAll(): Promise<void> {
    // Si ya está cargado, no hacer nada
    if (this.loaded) return;
    
    // Si ya está cargando, esperar a que termine
    if (this.loading && this.loadPromise) {
      return this.loadPromise;
    }

    // Iniciar carga
    this.loading = true;
    this.loadPromise = this._loadAll();
    
    try {
      await this.loadPromise;
    } finally {
      this.loading = false;
      this.loadPromise = null;
      // Notificar cambio de estado/carga
      this.notify();
    }
  }

  private async _loadAll(): Promise<void> {
    try {
      const response = await this.api.pentamont.api.data.all.get();
      
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to load data';
        throw new Error(errorMsg);
      }

      if (!response.data?.success) {
        throw new Error('Failed to load data');
      }

      const data = response.data.data;
      
      // Transformar los datos usando los métodos fromJSON de cada tipo
      this.tenants = (data.tenants || []).map((item: any) => Tenant.fromJSON(item));
      this.properties = (data.properties || []).map((item: any) => Property.fromJSON(item));
      this.contracts = (data.contracts || []).map((item: any) => Contract.fromJSON(item));
      this.payments = (data.payments || []).map((item: any) => Payment.fromJSON(item));
      
      this.loaded = true;
    } catch (error) {
      // Resetear estado en caso de error
      this.loaded = false;
      this.loading = false;
      throw error;
    }
  }

  // Métodos de acceso (sincrónicos, datos en memoria)
  getTenants(): Tenant[] {
    return [...this.tenants];
  }

  getProperties(): Property[] {
    return [...this.properties];
  }

  getContracts(): Contract[] {
    return [...this.contracts];
  }

  getPayments(): Payment[] {
    return [...this.payments];
  }

  // Métodos de búsqueda optimizados
  getTenantById(id: number): Tenant | undefined {
    return this.tenants.find(t => t.id === id);
  }

  getPropertyById(id: number): Property | undefined {
    return this.properties.find(p => p.id === id);
  }

  getContractById(id: number): Contract | undefined {
    return this.contracts.find(c => c.id === id);
  }

  getPaymentById(id: number): Payment | undefined {
    return this.payments.find(p => p.id === id);
  }

  getPropertiesByTenantId(tenantId: number): Property[] {
    return this.properties.filter(p => p.tenantId === tenantId);
  }

  getContractsByTenantId(tenantId: number): Contract[] {
    return this.contracts.filter(c => c.tenantId === tenantId);
  }

  getContractsByPropertyId(propertyId: number): Contract[] {
    return this.contracts.filter(c => c.propertyId === propertyId);
  }

  getPaymentsByTenantId(tenantId: number): Payment[] {
    return this.payments.filter(p => p.tenantId === tenantId);
  }

  getPaymentsByPropertyId(propertyId: number): Payment[] {
    return this.payments.filter(p => p.propertyId === propertyId);
  }

  getPaymentsByContractId(contractId: number): Payment[] {
    return this.payments.filter(p => p.contractId === contractId);
  }

  // Estado
  isLoaded(): boolean {
    return this.loaded;
  }

  isLoading(): boolean {
    return this.loading;
  }

  // Invalidar cache cuando hay mutations
  invalidate(): void {
    this.loaded = false;
    this.tenants = [];
    this.properties = [];
    this.contracts = [];
    this.payments = [];
    this.notify();
  }

  // Actualizar datos específicos después de mutations
  updateTenant(tenant: Tenant): void {
    const index = this.tenants.findIndex(t => t.id === tenant.id);
    if (index >= 0) {
      this.tenants[index] = tenant;
    } else {
      this.tenants.push(tenant);
    }
    this.notify();
  }

  updateProperty(property: Property): void {
    const index = this.properties.findIndex(p => p.id === property.id);
    if (index >= 0) {
      this.properties[index] = property;
    } else {
      this.properties.push(property);
    }
    this.notify();
  }

  updateContract(contract: Contract): void {
    const index = this.contracts.findIndex(c => c.id === contract.id);
    if (index >= 0) {
      this.contracts[index] = contract;
    } else {
      this.contracts.push(contract);
    }
    this.notify();
  }

  updatePayment(payment: Payment): void {
    const index = this.payments.findIndex(p => p.id === payment.id);
    if (index >= 0) {
      this.payments[index] = payment;
    } else {
      this.payments.push(payment);
    }
    this.notify();
  }

  removeTenant(id: number): void {
    this.tenants = this.tenants.filter(t => t.id !== id);
    this.notify();
  }

  removeProperty(id: number): void {
    this.properties = this.properties.filter(p => p.id !== id);
    this.notify();
  }

  removeContract(id: number): void {
    this.contracts = this.contracts.filter(c => c.id !== id);
    this.notify();
  }

  removePayment(id: number): void {
    this.payments = this.payments.filter(p => p.id !== id);
    this.notify();
  }
}


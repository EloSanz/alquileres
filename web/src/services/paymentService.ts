import { useApi } from '../contexts/ApiContext'

export interface Payment {
  id: number
  tenantId?: number | null
  propertyId: number | null
  contractId?: number | null
  monthNumber?: number | null
  tenantFullName?: string | null
  tenantPhone?: string | null
  amount: number
  paymentDate: string
  dueDate: string
  paymentMethod: string
  pentamontSettled?: boolean
  notes?: string | null
  createdAt: string
}

export interface CreatePaymentData {
  tenantId?: number
  propertyId: number | null
  amount: number
  paymentDate?: string
  dueDate: string
  paymentMethod?: string
  pentamontSettled?: boolean
  notes?: string
}

export interface UpdatePaymentData {
  tenantId?: number | null
  propertyId?: number | null
  amount?: number
  paymentDate?: string
  dueDate?: string
  paymentMethod?: string
  pentamontSettled?: boolean
  notes?: string
}

export const usePaymentService = () => {
  const api = useApi()
  
  return {
    getAllPayments: async (): Promise<Payment[]> => {
      const response = await api.api.payments.get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch payments'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch payments')
      }
      return response.data.data || []
    },
    
    getPaymentById: async (id: number): Promise<Payment> => {
      const response = await api.api.payments({ id }).get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch payment'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch payment')
      }
      return response.data.data
    },
    
    createPayment: async (paymentData: CreatePaymentData): Promise<Payment> => {
      const response = await api.api.payments.post(paymentData as any)
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to create payment'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to create payment')
      }
      return response.data.data
    },
    
    updatePayment: async (id: number, paymentData: UpdatePaymentData): Promise<Payment> => {
      const response = await api.api.payments({ id }).put(paymentData)
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to update payment'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update payment')
      }
      return response.data.data
    },
    
    deletePayment: async (id: number): Promise<void> => {
      const response = await api.api.payments({ id }).delete()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to delete payment'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to delete payment')
      }
    }
  }
}


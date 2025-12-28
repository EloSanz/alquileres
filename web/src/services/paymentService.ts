import { useApi } from '../contexts/ApiContext'
import { Payment, CreatePayment, UpdatePayment } from '../../../shared/types/Payment'

// Extended interface for frontend form that includes receiptImage
export interface CreatePaymentData extends CreatePayment {
  receiptImage?: File | null
}

export const usePaymentService = () => {
  const api = useApi()
  
  return {
    getAllPayments: async (): Promise<Payment[]> => {
      const response = await api.pentamont.api.payments.get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch payments'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch payments')
      }
      return (response.data.data || []).map((item: any) => Payment.fromJSON(item))
    },
    
    getPaymentById: async (id: number): Promise<Payment> => {
      const response = await api.pentamont.api.payments({ id }).get()
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch payment'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch payment')
      }
      return Payment.fromJSON(response.data.data)
    },
    
    getPaymentsByTenantId: async (tenantId: number): Promise<Payment[]> => {
      const response = await api.pentamont.api.payments.tenant({ tenantId }).get()
      
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to fetch payments'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch payments')
      }
      
      return (response.data.data || []).map((item: any) => {
        // Si Eden Treaty convirtió las fechas a Date objects, convertirlas de vuelta a strings
        const normalizedItem = { ...item };
        if (normalizedItem.paymentDate instanceof Date) {
          normalizedItem.paymentDate = normalizedItem.paymentDate.toISOString();
        }
        if (normalizedItem.dueDate instanceof Date) {
          normalizedItem.dueDate = normalizedItem.dueDate.toISOString();
        }
        return Payment.fromJSON(normalizedItem);
      });
    },
    
    createPayment: async (paymentData: CreatePaymentData): Promise<Payment> => {
      // TODO: En el futuro, aquí se haría el upload real de la imagen
      // Por ahora, ignoramos receiptImage y siempre usamos comprobante.png (mockeado en el backend)
      // if (paymentData.receiptImage) {
      //   const formData = new FormData();
      //   formData.append('image', paymentData.receiptImage);
      //   const uploadResponse = await fetch('/api/payments/upload', {
      //     method: 'POST',
      //     body: formData,
      //   });
      //   const uploadData = await uploadResponse.json();
      //   paymentData.receiptImageUrl = uploadData.url;
      // }
      
      // Remover receiptImage del payload ya que no se envía al backend por ahora
      const { receiptImage, ...payload } = paymentData;
      const createPayment = CreatePayment.fromJSON(payload);
      const errors = createPayment.validate();
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      
      const response = await api.pentamont.api.payments.post(createPayment.toJSON())
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to create payment'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to create payment')
      }
      return Payment.fromJSON(response.data.data)
    },
    
    updatePayment: async (id: number, paymentData: UpdatePayment): Promise<Payment> => {
      const errors = paymentData.validate();
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      
      const response = await api.pentamont.api.payments({ id }).put(paymentData.toJSON())
      
      if (response.error) {
        const errorMsg = typeof response.error.value === 'string' 
          ? response.error.value 
          : (response.error.value as any)?.message || 'Failed to update payment'
        throw new Error(errorMsg)
      }
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update payment')
      }
      
      // Si Eden Treaty convirtió las fechas a Date objects, convertirlas de vuelta a strings
      const updatedPaymentData: any = { ...response.data.data };
      if (updatedPaymentData.paymentDate instanceof Date) {
        updatedPaymentData.paymentDate = updatedPaymentData.paymentDate.toISOString();
      }
      if (updatedPaymentData.dueDate instanceof Date) {
        updatedPaymentData.dueDate = updatedPaymentData.dueDate.toISOString();
      }
      return Payment.fromJSON(updatedPaymentData)
    },
    
    deletePayment: async (id: number): Promise<void> => {
      const response = await api.pentamont.api.payments({ id }).delete()
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


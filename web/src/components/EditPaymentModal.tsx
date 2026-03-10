import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Alert,
  Grid,
  Autocomplete,
} from '@mui/material';
import { Receipt as ReceiptIcon } from '@mui/icons-material';
import { usePayments } from '../hooks/usePayments';
import { Payment, type CreatePayment, PaymentStatus, UpdatePaymentSchema, CreatePaymentSchema } from '../../../shared/types/Payment';
import { useProperties } from '../hooks/useProperties';
import { generateReceiptPDFDataUrl } from '../utils/receiptGenerator';
import PentaMontReceiptModal from './PentaMontReceiptModal';
import { useAuth } from '../contexts/AuthContext';
import { formatDateISO } from '../utils/dateUtils';
import { PaymentReceiptUpload } from './PaymentReceiptUpload';

export interface EditPaymentModalProps {
  open: boolean;
  payment: Payment | null;
  initialData?: Partial<CreatePayment>;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditPaymentModal({
  open,
  payment,
  initialData,
  onClose,
  onSuccess,
}: EditPaymentModalProps) {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(['ADMIN']);
  const { updatePayment, createPayment, isUpdating, isCreating, uploadImage, isUploading } = usePayments();
  const { properties } = useProperties();

  const [editForm, setEditForm] = useState({
    amount: '',
    paymentDate: '',
    dueDate: '',
    paymentMethod: 'YAPE' as any,
    status: PaymentStatus.FUTURO,
    notes: '',
    contractId: null as number | null,
    monthNumber: null as number | null,
    tenantId: null as number | null,
    propertyId: null as number | null,
    receiptImageUrl: null as string | null,
    receiptImagePublicId: null as string | null,
  });

  const [error, setError] = useState<string | null>(null);
  const [generatingReceipt, setGeneratingReceipt] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptPdfUrl, setReceiptPdfUrl] = useState<string | null>(null);


  const isEditMode = !!payment;
  const isLoading = isUpdating || isCreating || isUploading || generatingReceipt;

  useEffect(() => {
    if (open) {
      if (payment) {
        // Edit Mode
        const dateStr = formatDateISO(payment.dueDate);
        setEditForm({
          amount: payment.amount.toString(),
          paymentDate: formatDateISO(payment.paymentDate),
          dueDate: dateStr,
          paymentMethod: payment.paymentMethod || 'YAPE',
          status: payment.status || PaymentStatus.FUTURO,
          notes: payment.notes || '',
          contractId: payment.contractId,
          monthNumber: payment.monthNumber || (payment.dueDate ? new Date(payment.dueDate).getUTCMonth() + 1 : null),
          tenantId: payment.tenantId,
          propertyId: payment.propertyId,
          receiptImageUrl: payment.receiptImageUrl || null,
          receiptImagePublicId: payment.receiptImagePublicId || null,
        });
      } else {
        // Create Mode
        const defaultDueDate = (initialData?.dueDate as any) || formatDateISO(new Date());

        setEditForm({
          amount: initialData?.amount?.toString() || '',
          paymentDate: (initialData?.paymentDate as any) || formatDateISO(new Date()),
          dueDate: defaultDueDate,
          paymentMethod: (initialData?.paymentMethod as any) || 'YAPE',
          status: PaymentStatus.FUTURO,
          notes: initialData?.notes || '',
          contractId: null,
          monthNumber: new Date(defaultDueDate).getUTCMonth() + 1,
          tenantId: initialData?.tenantId || null,
          propertyId: initialData?.propertyId || null,
          receiptImageUrl: null,
          receiptImagePublicId: null,
        });
      }
      setError(null);
    }
  }, [open, payment, initialData]);

  // Sync monthNumber
  useEffect(() => {
    if (editForm.dueDate) {
      const selectedMonth = new Date(editForm.dueDate).getUTCMonth() + 1;
      setEditForm(prev => ({ ...prev, monthNumber: selectedMonth }));
    }
  }, [editForm.dueDate]);

  const handleImageSelect = async (file: File) => {
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await uploadImage(base64);
      setEditForm(prev => ({
        ...prev,
        receiptImageUrl: result.url,
        receiptImagePublicId: result.publicId
      }));
    } catch (err: any) {
      setError('Error al subir la imagen: ' + err.message);
    }
  };

  const handleSave = async () => {
    try {
      setError(null);
      const data = {
        amount: parseFloat(editForm.amount),
        paymentDate: editForm.paymentDate,
        dueDate: editForm.dueDate,
        paymentMethod: editForm.paymentMethod,
        status: editForm.status,
        notes: editForm.notes,
        contractId: editForm.contractId,
        monthNumber: editForm.monthNumber,
        tenantId: editForm.tenantId,
        propertyId: editForm.propertyId,
        receiptImageUrl: editForm.receiptImageUrl,
        receiptImagePublicId: editForm.receiptImagePublicId,
      };

      if (isEditMode && payment) {
        const validated = UpdatePaymentSchema.parse(data);
        await updatePayment({ id: payment.id, data: validated });
      } else {
        const validated = CreatePaymentSchema.parse(data);
        await createPayment(validated);
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Validation error:', err);
      if (err.issues) {
        setError(err.issues[0].message);
      } else {
        setError(err.message || 'Error al guardar el pago');
      }
    }
  };

  const handleGenerateReceipt = async () => {
    if (!editForm.propertyId || !editForm.amount) return;

    setGeneratingReceipt(true);
    try {
      const property = properties?.find(p => p.id === editForm.propertyId);
      const tenantName = property?.tenant ? `${property.tenant.firstName} ${property.tenant.lastName}` : 'Cliente';

      const mockPayment: any = {
        ...editForm,
        id: payment?.id || 'temp',
        amount: parseFloat(editForm.amount),
        property: property,
        tenantFullName: tenantName
      };

      const dataUrl = await generateReceiptPDFDataUrl(mockPayment);
      setReceiptPdfUrl(dataUrl);
      setReceiptModalOpen(true);
    } catch (err: any) {
      setError('Error al generar recibo: ' + err.message);
    } finally {
      setGeneratingReceipt(false);
    }
  };

  const handleReceiptModalClose = () => {
    setReceiptModalOpen(false);
    setReceiptPdfUrl(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
          {isEditMode ? 'Editar Pago' : 'Crear Pago'}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={3}>
          {/* Form Side - 5 columns */}
          <Grid item xs={12} md={5}>
            <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {!isEditMode && !initialData?.propertyId && (
                <Autocomplete
                  fullWidth
                  options={properties || []}
                  getOptionLabel={(property) =>
                    `Local N° ${property.localNumber} - ${property.ubicacion === 'BOULEVAR' ? 'Boulevard' : property.ubicacion === 'SAN_MARTIN' ? 'San Martin' : property.ubicacion}, ${property.tenant?.firstName || ''} ${property.tenant?.lastName || ''} (${property.monthlyRent} S/)`
                  }
                  value={properties?.find(p => p.id === editForm.propertyId) || null}
                  onChange={(_, newValue) => {
                    setEditForm(prev => ({
                      ...prev,
                      propertyId: newValue?.id || null,
                      tenantId: newValue?.tenantId || null,
                      amount: newValue?.monthlyRent?.toString() || prev.amount
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Seleccionar Local/Inquilino"
                      required
                      error={!editForm.propertyId && !!error}
                    />
                  )}
                  noOptionsText="No se encontraron locales"
                  disabled={!isAdmin || isLoading}
                />
              )}

              <TextField
                fullWidth
                label="Monto (S/)"
                type="number"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                required
                inputProps={{ min: 0, step: 0.01 }}
                disabled={!isAdmin || isLoading}
              />
              <TextField
                fullWidth
                label="Fecha de Pago Realizada"
                type="date"
                value={editForm.paymentDate}
                onChange={(e) => setEditForm({ ...editForm, paymentDate: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
                disabled={!isAdmin || isLoading}
              />
              <TextField
                select
                fullWidth
                label="Medio de Pago"
                value={editForm.paymentMethod}
                onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value as any })}
                disabled={!isAdmin || isLoading}
              >
                <MenuItem value="YAPE">Yape</MenuItem>
                <MenuItem value="DEPOSITO">Depósito</MenuItem>
                <MenuItem value="TRANSFERENCIA_VIRTUAL">Transferencia Virtual</MenuItem>
              </TextField>
              <TextField
                select
                fullWidth
                label="Estado"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as PaymentStatus })}
                required
                disabled={!isAdmin || isLoading}
              >
                <MenuItem value={PaymentStatus.PAGADO}>Pagado</MenuItem>
                <MenuItem value={PaymentStatus.VENCIDO}>Vencido</MenuItem>
                <MenuItem value={PaymentStatus.FUTURO}>Futuro</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Notas"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                multiline
                rows={4}
                disabled={!isAdmin || isLoading}
              />
            </Box>
          </Grid>

          {/* Image Side - 7 columns */}
          <Grid item xs={12} md={7}>
            <PaymentReceiptUpload
              imageUrl={editForm.receiptImageUrl}
              isUploading={isUploading}
              isAdmin={isAdmin}
              onImageSelect={handleImageSelect}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={isLoading || generatingReceipt}>
          Cancelar
        </Button>
        {isAdmin && (
          <>
            <Button
              onClick={handleGenerateReceipt}
              color="info"
              variant="outlined"
              startIcon={<ReceiptIcon />}
              disabled={isLoading || generatingReceipt || !editForm.propertyId}
              sx={{ borderRadius: 2 }}
            >
              {generatingReceipt ? 'GENERANDO...' : 'GENERAR RECIBO'}
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={isLoading || generatingReceipt || !editForm.propertyId || !editForm.amount}
              sx={{ borderRadius: 2, px: 4 }}
            >
              {isLoading ? 'GUARDANDO...' : (isEditMode ? 'ACTUALIZAR' : 'CREAR PAGO')}
            </Button>
          </>
        )}
      </DialogActions>

      <PentaMontReceiptModal
        open={receiptModalOpen}
        receiptPdfUrl={receiptPdfUrl}
        onClose={handleReceiptModalClose}
      />
    </Dialog>
  );
}

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
  Paper,
  Grid,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import { usePayments } from '../hooks/usePayments';
import { Payment, type UpdatePayment, type CreatePayment, PaymentStatus, UpdatePaymentSchema, CreatePaymentSchema } from '../../../shared/types/Payment';
import { generateReceiptPDFDataUrl } from '../utils/receiptGenerator';
import PentaMontReceiptModal from './PentaMontReceiptModal';
import { useAuth } from '../contexts/AuthContext';

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
  const [editForm, setEditForm] = useState({
    amount: '',
    paymentDate: '',
    dueDate: '',
    paymentMethod: 'YAPE',
    status: PaymentStatus.FUTURO,
    notes: '',
    contractId: null as number | null,
    monthNumber: null as number | null,
    tenantId: null as number | null,
    propertyId: null as number | null,
  });
  const [editReceiptImageFile, setEditReceiptImageFile] = useState<File | null>(null);
  const [editReceiptImagePreview, setEditReceiptImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [generatingReceipt, setGeneratingReceipt] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptPdfUrl, setReceiptPdfUrl] = useState<string | null>(null);

  const isEditMode = !!payment;
  const isLoading = isUpdating || isCreating || isUploading || generatingReceipt;

  // Cargar datos del pago cuando se abre el modal
  useEffect(() => {
    if (open) {
      if (payment) {
        // Edit Mode
        setEditForm({
          amount: payment.amount.toString(),
          paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
          dueDate: new Date(payment.dueDate).toISOString().split('T')[0],
          paymentMethod: payment.paymentMethod || 'YAPE',
          status: payment.status || PaymentStatus.FUTURO,
          notes: payment.notes || '',
          contractId: payment.contractId,
          monthNumber: payment.monthNumber,
          tenantId: payment.tenantId,
          propertyId: payment.propertyId,
        });
        setEditReceiptImagePreview(null);
      } else if (initialData) {
        // Create Mode with initial data
        setEditForm({
          amount: initialData.amount?.toString() || '',
          paymentDate: initialData.paymentDate || new Date().toISOString().split('T')[0],
          dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
          paymentMethod: initialData.paymentMethod || 'YAPE',
          status: initialData.status || PaymentStatus.FUTURO,
          notes: initialData.notes || '',
          contractId: initialData.contractId ?? null,
          monthNumber: initialData.monthNumber ?? null,
          tenantId: initialData.tenantId ?? null,
          propertyId: initialData.propertyId ?? null,
        });
        setEditReceiptImagePreview(null);
      } else {
        // Default Create Mode
        setEditForm({
          amount: '',
          paymentDate: new Date().toISOString().split('T')[0],
          dueDate: '',
          paymentMethod: 'YAPE',
          status: PaymentStatus.FUTURO,
          notes: '',
          contractId: null,
          monthNumber: null,
          tenantId: null,
          propertyId: null,
        });
        setEditReceiptImagePreview(null);
      }
      setEditReceiptImageFile(null);
      setError('');
    }
  }, [open, payment, initialData]);

  const handleEditImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditReceiptImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditReceiptImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setError('');

    try {
      let receiptImageUrl: string | null | undefined = undefined;
      let receiptImagePublicId: string | null | undefined = undefined;

      if (editReceiptImageFile) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(editReceiptImageFile!);
        });

        const uploadResult = await uploadImage(base64);
        receiptImageUrl = uploadResult.url;
        receiptImagePublicId = uploadResult.publicId;
      }

      if (isEditMode && payment) {
        const paymentData: UpdatePayment = {
          amount: parseFloat(editForm.amount),
          paymentDate: editForm.paymentDate,
          dueDate: editForm.dueDate,
          paymentMethod: editForm.paymentMethod,
          status: editForm.status,
          notes: editForm.notes || undefined,
          receiptImageUrl,
          receiptImagePublicId
        };

        UpdatePaymentSchema.parse(paymentData);
        await updatePayment({ id: payment.id, data: paymentData });
      } else {
        const finalContractId = editForm.contractId ?? initialData?.contractId ?? null;
        const finalMonthNumber = editForm.monthNumber ?? initialData?.monthNumber ?? null;
        const finalPropertyId = editForm.propertyId ?? initialData?.propertyId ?? null;
        const finalTenantId = editForm.tenantId ?? initialData?.tenantId;

        if (!finalTenantId) {
          throw new Error("Faltan datos requeridos (Inquilino) para crear el pago.");
        }

        const paymentData: CreatePayment = {
          tenantId: finalTenantId,
          propertyId: finalPropertyId,
          contractId: finalContractId,
          monthNumber: finalMonthNumber,
          amount: parseFloat(editForm.amount),
          paymentDate: editForm.paymentDate,
          dueDate: editForm.dueDate,
          paymentMethod: editForm.paymentMethod,
          status: editForm.status,
          notes: editForm.notes || undefined,
          receiptImageUrl,
          receiptImagePublicId
        };

        CreatePaymentSchema.parse(paymentData);
        await createPayment(paymentData);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      if (err.issues) {
        setError(err.issues[0].message);
      } else {
        setError(err.message || 'Error al guardar el pago');
      }
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEditReceiptImageFile(null);
      setEditReceiptImagePreview(null);
      onClose();
    }
  };

  const handleGenerateReceipt = async () => {
    if (!payment) return;
    setGeneratingReceipt(true);
    setError('');
    try {
      // Usar la nota del formulario por si el usuario escribió algo sin guardar
      const paymentWithCurrentNotes = {
        ...payment,
        notes: editForm.notes?.trim() || payment.notes,
      };
      const receiptPdf = await generateReceiptPDFDataUrl(paymentWithCurrentNotes);
      setReceiptPdfUrl(receiptPdf);
      setReceiptModalOpen(true);
    } catch (receiptError) {
      setError('Error al generar el recibo. Por favor, intente nuevamente.');
    } finally {
      setGeneratingReceipt(false);
    }
  };

  const handleReceiptModalClose = () => {
    setReceiptModalOpen(false);
    setReceiptPdfUrl(null);
  };

  // Si hay preview local lo mostramos; si el backend ya envió una URL real la usamos;
  // si es null, el render mostrará el mock comprobante.png
  const displayImage = editReceiptImagePreview || payment?.receiptImageUrl || null;

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
        <DialogTitle>{isAdmin ? (isEditMode ? 'Editar Pago' : 'Crear Pago') : 'Detalle del Pago'}</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={5} lg={4}>
              <Box component="form">
                <TextField
                  fullWidth
                  label="Monto (S/)"
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  required
                  sx={{ mb: 2 }}
                  inputProps={{ min: 0, step: 0.01 }}
                  disabled={!isAdmin}
                />
                <TextField
                  fullWidth
                  label="Fecha de Pago"
                  type="date"
                  value={editForm.paymentDate}
                  onChange={(e) => setEditForm({ ...editForm, paymentDate: e.target.value })}
                  required
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                  disabled={!isAdmin}
                />
                <TextField
                  fullWidth
                  label="Mes Correspondiente"
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  required
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                  disabled={!isAdmin}
                />

                <TextField
                  select
                  fullWidth
                  label="Medio de Pago"
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                  required
                  sx={{ mb: 2 }}
                  disabled={!isAdmin}
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
                  sx={{ mb: 2 }}
                  disabled={!isAdmin}
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
                  sx={{ mb: 2 }}
                  disabled={!isAdmin}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={7} lg={8}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Comprobante de Pago
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  minHeight: '400px',
                  height: '100%',
                  position: 'relative'
                }}
              >
                <Box
                  component="img"
                  src={displayImage || `${import.meta.env.BASE_URL || '/'}comprobante.png`.replace(/\/+/g, '/')}
                  alt="Comprobante"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '600px',
                    objectFit: 'contain',
                    borderRadius: 1,
                    mb: 2,
                    opacity: displayImage ? 1 : 0.4
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL || '/'}comprobante.png`.replace(/\/+/g, '/');
                  }}
                />

                {isAdmin && (
                  <Box sx={{ mt: 2, width: '100%', maxWidth: 300 }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="edit-receipt-image-upload"
                      type="file"
                      onChange={handleEditImageChange}
                    />
                    <label htmlFor="edit-receipt-image-upload">
                      <Button
                        variant="contained"
                        color="secondary"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                        disabled={isLoading}
                      >
                        {displayImage ? 'Cambiar Imagen' : 'Subir Imagen'}
                      </Button>
                    </label>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            {isAdmin ? 'Cancelar' : 'Cerrar'}
          </Button>
          {isAdmin && payment && payment.status === PaymentStatus.PAGADO && (
            <Button
              onClick={handleGenerateReceipt}
              variant="outlined"
              startIcon={<ReceiptIcon />}
              disabled={isLoading}
              sx={{ mr: 1 }}
            >
              {generatingReceipt ? 'Generando...' : 'Generar Recibo Penta Mont'}
            </Button>
          )}
          {isAdmin && (
            <Button onClick={handleSave} variant="contained" disabled={isLoading}>
              {isLoading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear Pago')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <PentaMontReceiptModal
        open={receiptModalOpen}
        receiptPdfUrl={receiptPdfUrl}
        onClose={handleReceiptModalClose}
      />
    </>
  );
}

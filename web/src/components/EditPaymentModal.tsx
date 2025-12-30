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
  Divider,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import { usePayments } from '../hooks/usePayments';
import { Payment, type UpdatePayment, PaymentStatus, UpdatePaymentSchema } from '../../../shared/types/Payment';
import { generateReceiptPDFDataUrl } from '../utils/receiptGenerator';
import PentaMontReceiptModal from './PentaMontReceiptModal';

export interface EditPaymentModalProps {
  open: boolean;
  payment: Payment | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditPaymentModal({
  open,
  payment,
  onClose,
  onSuccess,
}: EditPaymentModalProps) {
  const { updatePayment, isUpdating } = usePayments();
  const [editForm, setEditForm] = useState({
    amount: '',
    paymentDate: '',
    dueDate: '',
    paymentMethod: 'YAPE',
    status: PaymentStatus.FUTURO,
    notes: '',
  });
  const [editReceiptImageFile, setEditReceiptImageFile] = useState<File | null>(null);
  const [editReceiptImagePreview, setEditReceiptImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [generatingReceipt, setGeneratingReceipt] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptPdfUrl, setReceiptPdfUrl] = useState<string | null>(null);


  // Cargar datos del pago cuando se abre el modal
  useEffect(() => {
    if (open && payment) {
      setEditForm({
        amount: payment.amount.toString(),
        paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
        dueDate: new Date(payment.dueDate).toISOString().split('T')[0],
        paymentMethod: payment.paymentMethod || 'YAPE',
        status: payment.status || PaymentStatus.FUTURO,
        notes: payment.notes || '',
      });
      // Cargar preview de imagen existente si hay
      if (payment.receiptImageUrl && payment.receiptImageUrl !== '/comprobante.png') {
        setEditReceiptImagePreview(payment.receiptImageUrl);
      } else {
        setEditReceiptImagePreview(null);
      }
      setEditReceiptImageFile(null);
      setError('');
    } else if (!open) {
      // Limpiar formulario al cerrar
      setEditForm({
        amount: '',
        paymentDate: '',
        dueDate: '',
        paymentMethod: 'YAPE',
        status: PaymentStatus.FUTURO,
        notes: '',
      });
      setEditReceiptImageFile(null);
      setEditReceiptImagePreview(null);
      setError('');
    }
  }, [open, payment]);

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

  const handleUpdatePayment = async () => {
    if (!payment) return;

    setError('');

    try {
      // Si hay una nueva imagen, convertirla a base64 para enviarla como URL
      let receiptImageUrl: string | null | undefined = undefined;
      if (editReceiptImageFile) {
        // Convertir imagen a base64
        receiptImageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(editReceiptImageFile!);
        });
      } else if (editReceiptImagePreview && editReceiptImagePreview.startsWith('data:')) {
        // Si ya es base64, usar directamente
        receiptImageUrl = editReceiptImagePreview;
      } else if (editReceiptImagePreview) {
        // Si es una URL existente, mantenerla
        receiptImageUrl = editReceiptImagePreview;
      }

      const paymentData: UpdatePayment = {
        amount: parseFloat(editForm.amount),
        paymentDate: editForm.paymentDate,
        dueDate: editForm.dueDate,
        paymentMethod: editForm.paymentMethod,
        status: editForm.status,
        notes: editForm.notes || undefined,
        receiptImageUrl
      };

      // Validar con Zod
      UpdatePaymentSchema.parse(paymentData);

      await updatePayment({ id: payment.id, data: paymentData });

      // Llamar callback de éxito si existe
      if (onSuccess) {
        onSuccess();
      }

      // Cerrar modal de edición normalmente después de actualizar
      onClose();
    } catch (err: any) {
      if (err.issues) {
        setError(err.issues[0].message);
      } else {
        setError(err.message || 'Error al actualizar el pago');
      }
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
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
      const receiptPdf = await generateReceiptPDFDataUrl(payment);
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

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Editar Pago</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Monto (S/)"
              type="number"
              value={editForm.amount}
              onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              required
              sx={{ mb: 2 }}
              inputProps={{ min: 0, step: 0.01 }}
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
            />
            <TextField
              fullWidth
              label="Fecha de Vencimiento"
              type="date"
              value={editForm.dueDate}
              onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
              required
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              fullWidth
              label="Medio de Pago"
              value={editForm.paymentMethod}
              onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
              required
              sx={{ mb: 2 }}
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
              rows={2}
              sx={{ mb: 2 }}
            />

            {/* Upload de Comprobante */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Comprobante de Pago
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="edit-receipt-image-upload"
                type="file"
                onChange={handleEditImageChange}
                key={editReceiptImageFile ? editReceiptImageFile.name : 'edit-file-input'}
              />
              <label htmlFor="edit-receipt-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ mb: 2 }}
                  disabled={isUpdating}
                >
                  {editReceiptImageFile ? editReceiptImageFile.name : editReceiptImagePreview ? 'Cambiar Imagen del Comprobante' : 'Seleccionar Imagen del Comprobante'}
                </Button>
              </label>
              {editReceiptImagePreview && (
                <Box sx={{ mt: 2 }}>
                  <Box
                    component="img"
                    src={editReceiptImagePreview}
                    alt="Preview del comprobante"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      objectFit: 'contain',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Mostrar comprobante existente al final - solo si el estado es Pagado */}
            {payment && payment.status === PaymentStatus.PAGADO && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Comprobante de Pago
                </Typography>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                  }}
                >
                  <Box
                    component="img"
                    src={payment.receiptImageUrl && payment.receiptImageUrl !== '/comprobante.png'
                      ? payment.receiptImageUrl
                      : '/comprobante.png'}
                    alt="Comprobante de pago"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '500px',
                      objectFit: 'contain',
                      borderRadius: 1,
                    }}
                    onError={(e) => {
                      // Fallback si la imagen no se carga
                      (e.target as HTMLImageElement).src = '/comprobante.png';
                    }}
                  />
                </Paper>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isUpdating || generatingReceipt}>
            Cancelar
          </Button>
          {/* Botón para generar recibo - solo visible cuando el pago está en estado Pagado */}
          {payment && payment.status === PaymentStatus.PAGADO && (
            <Button
              onClick={handleGenerateReceipt}
              variant="outlined"
              startIcon={<ReceiptIcon />}
              disabled={isUpdating || generatingReceipt}
              sx={{ mr: 1 }}
            >
              {generatingReceipt ? 'Generando...' : 'Generar Recibo Penta Mont'}
            </Button>
          )}
          <Button onClick={handleUpdatePayment} variant="contained" disabled={isUpdating || generatingReceipt}>
            {isUpdating ? 'Actualizando...' : 'Actualizar'}
          </Button>
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

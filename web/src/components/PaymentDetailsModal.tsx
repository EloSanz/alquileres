import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Divider,
  Paper,
} from '@mui/material';
import type { Payment } from '../../../shared/types/Payment';

export interface PaymentDetailsModalProps {
  open: boolean;
  payment: Payment | null;
  onClose: () => void;
}

export default function PaymentDetailsModal({
  open,
  payment,
  onClose
}: PaymentDetailsModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  const formatDateLong = (dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return '-';
    const date = dateInput instanceof Date ? dateInput : (() => {
      const str = String(dateInput);
      const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const [, year, month, day] = match;
        return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      }
      return new Date(str);
    })();
    
    if (isNaN(date.getTime())) return String(dateInput);
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'YAPE':
        return 'Yape';
      case 'DEPOSITO':
        return 'Depósito';
      case 'TRANSFERENCIA_VIRTUAL':
        return 'Transferencia Virtual';
      default:
        return method;
    }
  };

  // Por ahora, todos los pagos usan la misma imagen
  // En el futuro, se puede usar payment.receiptImageUrl si está disponible
  const receiptImageUrl = payment?.receiptImageUrl || '/comprobante.png';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Detalle del Pago {payment ? `#${payment.id}` : ''}
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        {payment ? (
          <Stack spacing={3}>
            {/* Información del Pago */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Información del Pago
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Monto:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(payment.amount)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de Pago:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatDateLong(payment.paymentDate)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de Vencimiento:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatDateLong(payment.dueDate)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Medio de Pago:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {getPaymentMethodLabel(payment.paymentMethod)}
                  </Typography>
                </Box>
                {payment.paymentMethod === 'YAPE' && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Pentamont:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {payment.pentamontSettled ? 'Sí' : 'No'}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Información del Inquilino */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Información del Inquilino
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Nombre:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {payment.tenantFullName || `ID: ${payment.tenantId || 'N/A'}`}
                  </Typography>
                </Box>
                {payment.tenantPhone && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Teléfono:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {payment.tenantPhone}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Notas */}
            {payment.notes && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Notas
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {payment.notes}
                </Typography>
              </Box>
            )}

            {/* Comprobante */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Comprobante
              </Typography>
              <Divider sx={{ mb: 2 }} />
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
                  src={receiptImageUrl}
                  alt="Comprobante de pago"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '500px',
                    objectFit: 'contain',
                    borderRadius: 1,
                  }}
                  onError={(e) => {
                    // Fallback si la imagen no se carga
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </Paper>
            </Box>
          </Stack>
        ) : (
          <Typography color="text.secondary">
            No hay información del pago disponible
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}


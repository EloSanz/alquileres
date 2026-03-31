import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Delete as DeleteIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { ServiceReceipt, useServiceReceipts } from '../hooks/useServiceReceipts';
import { PaymentReceiptUpload } from './PaymentReceiptUpload';

interface ServiceReceiptDetailModalProps {
  receipt: ServiceReceipt | null;
  onClose: () => void;
}

export default function ServiceReceiptDetailModal({ receipt, onClose }: ServiceReceiptDetailModalProps) {
  const { uploadImage, updateImage, deleteReceipt, isUploading, isUpdatingImage, isDeleting } = useServiceReceipts();
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isLoading = isUploading || isUpdatingImage || isDeleting;

  if (!receipt) return null;

  const handleImageSelect = async (file: File) => {
    setError(null);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const uploaded = await uploadImage(base64);
      await updateImage({ id: receipt.id, receiptImageUrl: uploaded.url, receiptImagePublicId: uploaded.publicId });
    } catch (err: any) {
      setError('Error al subir imagen: ' + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReceipt(receipt.id);
      onClose();
    } catch (err: any) {
      setError('Error al eliminar: ' + err.message);
      setConfirmDelete(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00Z').toLocaleDateString('es-PE', {
      day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC',
    });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

  return (
    <Dialog open={!!receipt} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Detalle del Recibo</Typography>
        <Chip
          label={receipt.categoryLabel || receipt.categoryName || '-'}
          color={receipt.categoryName === 'AGUA' ? 'info' : 'warning'}
          variant="outlined"
          size="small"
        />
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
          {/* Info */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <InfoRow label="Fecha" value={formatDate(receipt.paymentDate)} />
            <Divider />
            <InfoRow label="Inquilino" value={receipt.tenantName || '—'} />
            <Divider />
            <InfoRow
              label="Monto"
              value={receipt.amount != null ? formatCurrency(receipt.amount) : '—'}
            />
            <Divider />
            <InfoRow
              label="Origen"
              value={receipt.kind === 'GENERATED' ? 'Recibo generado' : 'Comprobante cargado'}
            />
            {receipt.notes && (
              <>
                <Divider />
                <InfoRow label="Notas" value={receipt.notes} />
              </>
            )}
            {receipt.receiptImageUrl && (
              <>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90 }}>Comprobante</Typography>
                  <Button
                    size="small"
                    endIcon={<OpenInNewIcon fontSize="small" />}
                    href={receipt.receiptImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ textTransform: 'none' }}
                  >
                    Ver archivo
                  </Button>
                </Box>
              </>
            )}
          </Box>

          {/* Upload comprobante */}
          <Box sx={{ flex: 1 }}>
            <PaymentReceiptUpload
              imageUrl={receipt.receiptImageUrl}
              isUploading={isUploading || isUpdatingImage}
              isAdmin={true}
              onImageSelect={handleImageSelect}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        {!confirmDelete ? (
          <Button
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setConfirmDelete(true)}
            disabled={isLoading}
          >
            Eliminar
          </Button>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="error">¿Confirmar eliminación?</Typography>
            <Button
              color="error"
              variant="contained"
              size="small"
              onClick={handleDelete}
              disabled={isDeleting}
              startIcon={isDeleting ? <CircularProgress size={14} color="inherit" /> : undefined}
            >
              Sí, eliminar
            </Button>
            <Button size="small" onClick={() => setConfirmDelete(false)} disabled={isDeleting}>
              Cancelar
            </Button>
          </Box>
        )}
        <Button onClick={onClose} disabled={isLoading}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
}

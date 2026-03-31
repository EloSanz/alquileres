import { useState } from 'react';
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
  CircularProgress,
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { useTenants } from '../hooks/useTenants';
import { useServiceCategories } from '../hooks/useServiceCategories';
import { useServiceReceipts } from '../hooks/useServiceReceipts';
import { PaymentReceiptUpload } from './PaymentReceiptUpload';
import { formatDateISO } from '../utils/dateUtils';

interface UploadServiceReceiptModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UploadServiceReceiptModal({ open, onClose }: UploadServiceReceiptModalProps) {
  const { tenants } = useTenants();
  const { categories } = useServiceCategories();
  const { createReceipt, uploadImage, isUploading, isCreating } = useServiceReceipts();

  const [form, setForm] = useState({
    categoryId: '' as number | '',
    amount: '',
    paymentDate: formatDateISO(new Date()),
    tenantName: '',
    notes: '',
    receiptImageUrl: null as string | null,
    receiptImagePublicId: null as string | null,
  });

  const [selectedTenant, setSelectedTenant] = useState<{ id: number; firstName: string; lastName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isLoading = isUploading || isCreating;

  const handleTenantChange = (_: any, tenant: typeof selectedTenant) => {
    setSelectedTenant(tenant);
    setForm(prev => ({
      ...prev,
      tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : '',
    }));
  };

  const handleImageSelect = async (file: File) => {
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await uploadImage(base64);
      setForm(prev => ({ ...prev, receiptImageUrl: result.url, receiptImagePublicId: result.publicId }));
    } catch (err: any) {
      setError('Error al subir la imagen: ' + err.message);
    }
  };

  const handleSave = async () => {
    if (!form.categoryId) return;
    setError(null);
    try {
      await createReceipt({
        categoryId: form.categoryId as number,
        tenantId: selectedTenant?.id ?? null,
        tenantName: form.tenantName || null,
        paymentDate: form.paymentDate,
        amount: form.amount ? parseFloat(form.amount) : null,
        receiptImageUrl: form.receiptImageUrl,
        receiptImagePublicId: form.receiptImagePublicId,
        kind: 'UPLOADED',
        notes: form.notes || null,
      });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 800);
    } catch (err: any) {
      setError('Error al guardar: ' + err.message);
    }
  };

  const handleClose = () => {
    setForm({
      categoryId: '',
      amount: '',
      paymentDate: formatDateISO(new Date()),
      tenantName: '',
      notes: '',
      receiptImageUrl: null,
      receiptImagePublicId: null,
    });
    setSelectedTenant(null);
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
          Cargar Comprobante de Servicio
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Comprobante guardado correctamente</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Autocomplete
                options={tenants}
                getOptionLabel={(t) => `${t.firstName} ${t.lastName}`}
                value={selectedTenant}
                onChange={handleTenantChange}
                renderInput={(params) => (
                  <TextField {...params} label="Inquilino (opcional)" placeholder="Buscar por nombre..." />
                )}
                noOptionsText="No se encontraron inquilinos"
                disabled={isLoading}
              />

              <TextField
                select
                fullWidth
                label="Tipo de Servicio"
                value={form.categoryId}
                onChange={(e) => setForm(prev => ({ ...prev, categoryId: Number(e.target.value) }))}
                required
                disabled={isLoading}
              >
                {categories.length === 0 ? (
                  <MenuItem disabled value="">Cargando...</MenuItem>
                ) : (
                  categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>
                  ))
                )}
              </TextField>

              <TextField
                fullWidth
                label="Monto (S/) (opcional)"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                inputProps={{ min: 0, step: 0.01 }}
                disabled={isLoading}
              />

              <TextField
                fullWidth
                label="Fecha de Pago"
                type="date"
                value={form.paymentDate}
                onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
                disabled={isLoading}
              />

              <TextField
                fullWidth
                label="Notas"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                multiline
                rows={4}
                disabled={isLoading}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={7}>
            <PaymentReceiptUpload
              imageUrl={form.receiptImageUrl}
              isUploading={isUploading}
              isAdmin={true}
              onImageSelect={handleImageSelect}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          startIcon={isCreating ? <CircularProgress size={16} color="inherit" /> : <UploadIcon />}
          disabled={isLoading || !form.categoryId}
          sx={{ borderRadius: 2 }}
        >
          {isCreating ? 'GUARDANDO...' : 'GUARDAR COMPROBANTE'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

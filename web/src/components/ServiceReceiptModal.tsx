import { useState, useEffect, useRef } from 'react';
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
  Paper,
} from '@mui/material';
import { Receipt as ReceiptIcon } from '@mui/icons-material';
import { useTenants } from '../hooks/useTenants';
import { useServiceCategories } from '../hooks/useServiceCategories';
import { useServiceReceipts } from '../hooks/useServiceReceipts';
import PentaMontReceiptModal from './PentaMontReceiptModal';
import { generateServiceReceiptPDFDataUrl, ServiceReceiptData } from '../utils/receiptGenerator';
import { formatDateISO } from '../utils/dateUtils';

interface ServiceReceiptModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ServiceReceiptModal({ open, onClose }: ServiceReceiptModalProps) {
  const { tenants } = useTenants();
  const { categories } = useServiceCategories();
  const { createReceipt, isCreating } = useServiceReceipts();

  const [form, setForm] = useState({
    categoryId: '' as number | '',
    amount: '',
    paymentDate: formatDateISO(new Date()),
    tenantName: '',
    notes: '',
  });

  const [selectedTenant, setSelectedTenant] = useState<{ id: number; firstName: string; lastName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptPdfUrl, setReceiptPdfUrl] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLoading = saving || isCreating;
  const canGenerate = !!form.amount && !!form.categoryId;

  // Live preview: regenerate PDF on form change (debounced 400ms)
  useEffect(() => {
    if (!canGenerate) {
      setPreviewUrl(null);
      return;
    }

    setPreviewLoading(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const selectedCategory = categories.find(c => c.id === form.categoryId);
        const data: ServiceReceiptData = {
          serviceType: selectedCategory?.name ?? '',
          serviceLabel: selectedCategory?.label,
          amount: parseFloat(form.amount),
          paymentDate: form.paymentDate,
          tenantName: form.tenantName || undefined,
          notes: form.notes || undefined,
        };
        const url = await generateServiceReceiptPDFDataUrl(data);
        setPreviewUrl(url);
      } catch {
        setPreviewUrl(null);
      } finally {
        setPreviewLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form.categoryId, form.amount, form.paymentDate, form.tenantName, form.notes, categories]);

  const handleTenantChange = (_: any, tenant: typeof selectedTenant) => {
    setSelectedTenant(tenant);
    setForm(prev => ({
      ...prev,
      tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : '',
    }));
  };

  const handleGenerateReceipt = async () => {
    if (!canGenerate) return;
    setSaving(true);
    setError(null);
    try {
      const selectedCategory = categories.find(c => c.id === form.categoryId);
      const data: ServiceReceiptData = {
        serviceType: selectedCategory?.name ?? '',
        serviceLabel: selectedCategory?.label,
        amount: parseFloat(form.amount),
        paymentDate: form.paymentDate,
        tenantName: form.tenantName || undefined,
        notes: form.notes || undefined,
      };
      const dataUrl = await generateServiceReceiptPDFDataUrl(data);
      setReceiptPdfUrl(dataUrl);
      setReceiptModalOpen(true);

      await createReceipt({
        categoryId: form.categoryId as number,
        tenantId: selectedTenant?.id ?? null,
        tenantName: form.tenantName || null,
        paymentDate: form.paymentDate,
        amount: parseFloat(form.amount),
        kind: 'GENERATED',
        notes: form.notes || null,
      });
    } catch (err: any) {
      setError('Error al generar recibo: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setForm({
      categoryId: '',
      amount: '',
      paymentDate: formatDateISO(new Date()),
      tenantName: '',
      notes: '',
    });
    setSelectedTenant(null);
    setError(null);
    setPreviewUrl(null);
    setReceiptPdfUrl(null);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            Generar Recibo de Servicio
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={3}>
            {/* Formulario */}
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
                  label="Monto (S/)"
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
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

            {/* Vista previa en tiempo real */}
            <Grid item xs={12} md={7}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Vista previa
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  minHeight: 480,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.50',
                }}
              >
                {!canGenerate ? (
                  <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', px: 4 }}>
                    Completá tipo de servicio y monto para ver la vista previa
                  </Typography>
                ) : previewLoading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={32} />
                    <Typography variant="caption" color="text.secondary">Generando vista previa...</Typography>
                  </Box>
                ) : previewUrl ? (
                  <Box
                    component="iframe"
                    src={previewUrl}
                    title="Vista previa del recibo"
                    sx={{ width: '100%', height: 480, border: 'none' }}
                  />
                ) : null}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerateReceipt}
            color="primary"
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <ReceiptIcon />}
            disabled={isLoading || !canGenerate}
            sx={{ borderRadius: 2 }}
          >
            {isLoading ? 'GENERANDO...' : 'GENERAR RECIBO'}
          </Button>
        </DialogActions>
      </Dialog>

      <PentaMontReceiptModal
        open={receiptModalOpen}
        receiptPdfUrl={receiptPdfUrl}
        onClose={() => { setReceiptModalOpen(false); setReceiptPdfUrl(null); }}
      />
    </>
  );
}

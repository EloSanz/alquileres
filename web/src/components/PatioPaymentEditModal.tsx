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
    Stack,
    CircularProgress,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import { usePatioPayments } from '../hooks/usePatioPayments';
import { usePatioTenants } from '../hooks/usePatioTenants';
import { PatioPayment, CreatePatioPayment, UpdatePatioPayment } from '../../../shared/types/PatioPayment';
import { useAuth } from '../contexts/AuthContext';
import { generatePatioReceiptPDFDataUrl } from '../utils/receiptGenerator';
import PentaMontReceiptModal from './PentaMontReceiptModal';

export interface PatioPaymentEditModalProps {
    open: boolean;
    payment: PatioPayment | null;
    initialData?: Partial<CreatePatioPayment>;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function PatioPaymentEditModal({
    open,
    payment,
    initialData,
    onClose,
    onSuccess,
}: PatioPaymentEditModalProps) {
    const { hasRole } = useAuth();
    const isAdmin = hasRole(['ADMIN']);
    const { updatePatioPayment, createPatioPayment, isUpdating, isCreating, uploadImage, isUploading } = usePatioPayments();
    const { patioTenants } = usePatioTenants();

    const [receiptPdfUrl, setReceiptPdfUrl] = useState<string | null>(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);

    const [form, setForm] = useState({
        monto: '',
        fechaPago: '',
        fechaVencimiento: '',
        metodoPago: 'YAPE' as 'YAPE' | 'DEPOSITO' | 'TRANSFERENCIA_VIRTUAL',
        estado: 'PAGADO' as 'PAGADO' | 'VENCIDO' | 'FUTURO',
        notas: '',
        patioTenantId: null as number | null,
    });

    const [receiptImagePreview, setReceiptImagePreview] = useState<string | null>(null);
    const [uploadedImageData, setUploadedImageData] = useState<{ url: string; publicId: string } | null>(null);
    const [error, setError] = useState('');

    const isEditMode = !!payment;
    const isLoading = isUpdating || isCreating || isUploading;

    useEffect(() => {
        if (open) {
            if (payment) {
                setForm({
                    monto: payment.monto.toString(),
                    fechaPago: payment.fechaPago ? new Date(payment.fechaPago).toISOString().split('T')[0] : '',
                    fechaVencimiento: new Date(payment.fechaVencimiento).toISOString().split('T')[0],
                    metodoPago: payment.metodoPago,
                    estado: payment.estado,
                    notas: payment.notas || '',
                    patioTenantId: payment.patioTenantId,
                });
            } else if (initialData) {
                setForm({
                    monto: initialData.monto?.toString() || '',
                    fechaPago: initialData.fechaPago || new Date().toISOString().split('T')[0],
                    fechaVencimiento: initialData.fechaVencimiento || '',
                    metodoPago: initialData.metodoPago || 'YAPE',
                    estado: initialData.estado || 'PAGADO',
                    notas: initialData.notas || '',
                    patioTenantId: initialData.patioTenantId ?? null,
                });
            }
            setReceiptImagePreview(null);
            setUploadedImageData(null);
            setError('');
        }
    }, [open, payment, initialData]);

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setError('');

            // Show preview immediately
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Upload immediately
            try {
                const base64 = await new Promise<string>((resolve, reject) => {
                    const r = new FileReader();
                    r.onloadend = () => resolve(r.result as string);
                    r.onerror = reject;
                    r.readAsDataURL(file);
                });

                const result = await uploadImage(base64);
                setUploadedImageData(result);
            } catch (err: any) {
                setError(err.message || 'Error al subir la imagen');
                setReceiptImagePreview(null);
            }
        }
    };

    const handleSave = async () => {
        setError('');
        const montoVal = parseFloat(form.monto);
        if (isNaN(montoVal) || montoVal < 0.01) {
            setError('El monto debe ser mayor o igual a 0.01');
            return;
        }

        try {
            const receiptImageUrl = uploadedImageData?.url;
            const receiptImagePublicId = uploadedImageData?.publicId;

            if (isEditMode && payment) {
                const data: UpdatePatioPayment = {
                    monto: parseFloat(form.monto),
                    fechaPago: form.fechaPago || undefined,
                    fechaVencimiento: form.fechaVencimiento,
                    metodoPago: form.metodoPago,
                    estado: form.estado,
                    notas: form.notas || undefined,
                    receiptImageUrl,
                    receiptImagePublicId,
                };
                await updatePatioPayment({ id: payment.id, data });
            } else {
                if (!form.patioTenantId) throw new Error("Tenant ID is required");
                const data: CreatePatioPayment = {
                    patioTenantId: form.patioTenantId,
                    monto: parseFloat(form.monto),
                    fechaPago: form.fechaPago || undefined,
                    fechaVencimiento: form.fechaVencimiento,
                    metodoPago: form.metodoPago,
                    estado: form.estado,
                    notas: form.notas || undefined,
                    receiptImageUrl,
                    receiptImagePublicId,
                };
                await createPatioPayment(data);
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al guardar el pago');
        }
    };

    const handleGenerateReceipt = async () => {
        try {
            setIsGeneratingReceipt(true);
            const tenant = patioTenants.find(t => t.id === form.patioTenantId);
            if (!tenant) throw new Error("Inquilino no encontrado");

            const montoVal = parseFloat(form.monto);
            if (isNaN(montoVal) || montoVal < 0.01) {
                throw new Error('El monto debe ser válido para generar el recibo');
            }

            if (!form.fechaVencimiento) {
                throw new Error('La fecha de vencimiento es requerida para el recibo');
            }

            const mockPayment: PatioPayment = {
                id: payment?.id || 0,
                patioTenantId: form.patioTenantId!,
                monto: montoVal,
                fechaPago: form.fechaPago || new Date().toISOString(),
                fechaVencimiento: form.fechaVencimiento,
                metodoPago: form.metodoPago,
                estado: form.estado,
                notas: form.notas,
                pentamontSettled: payment?.pentamontSettled || false,
                receiptImageUrl: payment?.receiptImageUrl || null,
                receiptImagePublicId: payment?.receiptImagePublicId || null,
                createdAt: payment?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const dataUrl = await generatePatioReceiptPDFDataUrl(mockPayment, tenant.nombreComercial || tenant.nombre);
            setReceiptPdfUrl(dataUrl);
            setIsReceiptModalOpen(true);
        } catch (err: any) {
            setError(err.message || 'Error al generar el recibo');
        } finally {
            setIsGeneratingReceipt(false);
        }
    };

    const displayImage = receiptImagePreview || payment?.receiptImageUrl || null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
            <DialogTitle>{isEditMode ? 'Editar Pago' : 'Crear Pago'}</DialogTitle>
            <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Grid container spacing={3}>
                    <Grid item xs={12} md={5}>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                fullWidth
                                label="Monto (S/)"
                                type="number"
                                value={form.monto}
                                onChange={(e) => setForm({ ...form, monto: e.target.value })}
                                required
                                disabled={!isAdmin || isLoading}
                            />
                            <TextField
                                fullWidth
                                label="Fecha de Pago"
                                type="date"
                                value={form.fechaPago}
                                onChange={(e) => setForm({ ...form, fechaPago: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                disabled={!isAdmin || isLoading}
                            />
                            <TextField
                                fullWidth
                                label="Mes Correspondiente"
                                type="date"
                                value={form.fechaVencimiento}
                                onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })}
                                required
                                InputLabelProps={{ shrink: true }}
                                disabled={!isAdmin || isLoading}
                            />
                            <TextField
                                select
                                fullWidth
                                label="Medio de Pago"
                                value={form.metodoPago}
                                onChange={(e) => setForm({ ...form, metodoPago: e.target.value as any })}
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
                                value={form.estado}
                                onChange={(e) => setForm({ ...form, estado: e.target.value as any })}
                                disabled={!isAdmin || isLoading}
                            >
                                <MenuItem value="PAGADO">Pagado</MenuItem>
                                <MenuItem value="VENCIDO">Vencido</MenuItem>
                                <MenuItem value="FUTURO">Futuro</MenuItem>
                            </TextField>
                            <TextField
                                fullWidth
                                label="Notas"
                                value={form.notas}
                                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                                multiline
                                rows={4}
                                disabled={!isAdmin || isLoading}
                            />
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={7}>
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
                                position: 'relative',
                            }}
                        >
                            <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <Box
                                    component="img"
                                    src={displayImage || `${import.meta.env.BASE_URL || '/'}comprobante.png`.replace(/\/+/g, '/')}
                                    alt="Comprobante"
                                    sx={{
                                        maxWidth: '100%',
                                        maxHeight: '500px',
                                        objectFit: 'contain',
                                        borderRadius: 1,
                                        mb: 2,
                                        opacity: isUploading ? 0.5 : (displayImage ? 1 : 0.4),
                                        transition: 'opacity 0.3s',
                                    }}
                                />
                                {isUploading && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 1,
                                            zIndex: 2,
                                        }}
                                    >
                                        <CircularProgress size={40} />
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            Subiendo imagen...
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                            {isAdmin && (
                                <Box>
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="patio-receipt-upload"
                                        type="file"
                                        onChange={handleImageChange}
                                    />
                                    <label htmlFor="patio-receipt-upload">
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            component="span"
                                            startIcon={<CloudUploadIcon />}
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
                <Button onClick={onClose} disabled={isLoading || isGeneratingReceipt}>Cancelar</Button>
                {isAdmin && (
                    <>
                        <Button
                            onClick={handleGenerateReceipt}
                            color="info"
                            startIcon={<ReceiptIcon />}
                            disabled={isLoading || isGeneratingReceipt || !form.patioTenantId}
                        >
                            {isGeneratingReceipt ? 'Generando...' : 'Generar Recibo'}
                        </Button>
                        <Button onClick={handleSave} variant="contained" disabled={isLoading || isGeneratingReceipt}>
                            {isLoading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear Pago')}
                        </Button>
                    </>
                )}
            </DialogActions>

            <PentaMontReceiptModal
                open={isReceiptModalOpen}
                receiptPdfUrl={receiptPdfUrl}
                onClose={() => setIsReceiptModalOpen(false)}
            />
        </Dialog>
    );
}

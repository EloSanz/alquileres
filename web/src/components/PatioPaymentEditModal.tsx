import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Alert,
    Grid,
    Stack,
    Chip,
} from '@mui/material';
import { Receipt as ReceiptIcon } from '@mui/icons-material';
import { usePatioPayments } from '../hooks/usePatioPayments';
import { usePatioTenants } from '../hooks/usePatioTenants';
import { PatioPayment, CreatePatioPayment, UpdatePatioPayment } from '../../../shared/types/PatioPayment';
import { useAuth } from '../contexts/AuthContext';
import { generatePatioReceiptPDFDataUrl } from '../utils/receiptGenerator';
import PentaMontReceiptModal from './PentaMontReceiptModal';
import { getMonthNameUTC, formatDateISO } from '../utils/dateUtils';
import { PaymentReceiptUpload } from './PaymentReceiptUpload';

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

    const [initialMonth, setInitialMonth] = useState<number | null>(null);
    const [showMonthWarning, setShowMonthWarning] = useState(false);

    const isEditMode = !!payment;
    const isLoading = isUpdating || isCreating || isUploading;

    useEffect(() => {
        if (open) {
            if (payment) {
                const dateStr = formatDateISO(payment.fechaVencimiento);
                const month = new Date(payment.fechaVencimiento).getUTCMonth() + 1;
                setForm({
                    monto: payment.monto.toString(),
                    fechaPago: payment.fechaPago ? formatDateISO(payment.fechaPago) : '',
                    fechaVencimiento: dateStr,
                    metodoPago: payment.metodoPago,
                    estado: payment.estado,
                    notas: payment.notas || '',
                    patioTenantId: payment.patioTenantId,
                });
                setInitialMonth(month);
            } else if (initialData) {
                const defaultDueDate = (initialData.fechaVencimiento as string) || formatDateISO(new Date());
                const defaultMonth = new Date(defaultDueDate).getUTCMonth() + 1;
                setForm({
                    monto: initialData.monto?.toString() || '',
                    fechaPago: initialData.fechaPago || formatDateISO(new Date()),
                    fechaVencimiento: defaultDueDate,
                    metodoPago: initialData.metodoPago || 'YAPE',
                    estado: initialData.estado || 'PAGADO',
                    notas: initialData.notas || '',
                    patioTenantId: initialData.patioTenantId ?? null,
                });
                setInitialMonth(defaultMonth);
            }
            setReceiptImagePreview(null);
            setUploadedImageData(null);
            setError('');
            setShowMonthWarning(false);
        }
    }, [open, payment, initialData]);

    // Sync guardrails
    useEffect(() => {
        if (form.fechaVencimiento) {
            const selectedMonth = new Date(form.fechaVencimiento).getUTCMonth() + 1;
            if (initialMonth !== null && selectedMonth !== initialMonth) {
                setShowMonthWarning(true);
            } else {
                setShowMonthWarning(false);
            }
        }
    }, [form.fechaVencimiento, initialMonth]);

    const handleImageChange = async (file: File) => {
        try {
            setError('');
            const base64 = await new Promise<string>((resolve, reject) => {
                const r = new FileReader();
                r.onloadend = () => resolve(r.result as string);
                r.onerror = reject;
                r.readAsDataURL(file);
            });

            const result = await uploadImage(base64);
            setUploadedImageData(result);
            setReceiptImagePreview(result.url);
        } catch (err: any) {
            setError(err.message || 'Error al subir la imagen');
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


    return (
        <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
            <DialogTitle>{isEditMode ? 'Editar Pago' : 'Crear Pago'}</DialogTitle>
            <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {showMonthWarning && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Atención: Estás registrando un pago para <strong>{getMonthNameUTC(form.fechaVencimiento)}</strong>, pero la vista actual corresponde a un periodo diferente.
                    </Alert>
                )}

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
                            <Stack direction="row" spacing={1} alignItems="center">
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
                                {form.fechaVencimiento && (
                                    <Chip
                                        label={getMonthNameUTC(form.fechaVencimiento)}
                                        color="primary"
                                        variant="outlined"
                                        sx={{ fontWeight: 'bold', height: 56, px: 2 }}
                                    />
                                )}
                            </Stack>
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
                        <PaymentReceiptUpload
                            imageUrl={receiptImagePreview || payment?.receiptImageUrl || null}
                            isUploading={isUploading}
                            isAdmin={isAdmin}
                            onImageSelect={handleImageChange}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} disabled={isLoading || isGeneratingReceipt}>
                    Cancelar
                </Button>
                {isAdmin && (
                    <>
                        <Button
                            onClick={handleGenerateReceipt}
                            color="info"
                            variant="outlined"
                            startIcon={<ReceiptIcon />}
                            disabled={isLoading || isGeneratingReceipt || !form.patioTenantId}
                            sx={{ borderRadius: 2 }}
                        >
                            {isGeneratingReceipt ? 'Generando...' : 'GENERAR RECIBO'}
                        </Button>
                        <Button
                            onClick={handleSave}
                            variant="contained"
                            disabled={isLoading || isGeneratingReceipt}
                            sx={{ borderRadius: 2, px: 4 }}
                        >
                            {isLoading ? 'Guardando...' : (isEditMode ? 'ACTUALIZAR' : 'CREAR PAGO')}
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

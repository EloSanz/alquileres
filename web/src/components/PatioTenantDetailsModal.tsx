import { useState, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    IconButton,
    Chip,
    Tooltip,
} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
    Receipt as ReceiptIcon,
    Notes as NotesIcon,
} from '@mui/icons-material';
import { PatioTenant } from '../../../shared/types/PatioTenant';
import { PatioPayment } from '../../../shared/types/PatioPayment';
import { usePatioPayments } from '../hooks/usePatioPayments';
import PatioPaymentEditModal from './PatioPaymentEditModal';
import PentaMontReceiptModal from './PentaMontReceiptModal';
import { useAuth } from '../contexts/AuthContext';
import { generatePatioReceiptPDFDataUrl } from '../utils/receiptGenerator';
import { formatDateUTC } from '../utils/dateUtils';

interface PatioTenantDetailsModalProps {
    open: boolean;
    tenant: PatioTenant | null;
    onClose: () => void;
}

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function PatioTenantDetailsModal({
    open,
    tenant,
    onClose,
}: PatioTenantDetailsModalProps) {
    const { hasRole } = useAuth();
    const isAdmin = hasRole(['ADMIN']);
    const { patioPayments } = usePatioPayments();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [editingPayment, setEditingPayment] = useState<PatioPayment | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [initialData, setInitialData] = useState<any>(null);
    const [receiptPdfUrl, setReceiptPdfUrl] = useState<string | null>(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);

    const tenantPayments = useMemo(() => {
        return patioPayments.filter(p => p.patioTenantId === tenant?.id);
    }, [patioPayments, tenant]);

    const paymentsByMonth = useMemo(() => {
        const map: Record<number, PatioPayment> = {};
        tenantPayments.forEach(p => {
            const date = new Date(p.fechaVencimiento);
            if (date.getUTCFullYear() === selectedYear) {
                map[date.getUTCMonth()] = p;
            }
        });
        return map;
    }, [tenantPayments, selectedYear]);

    const handleEditPayment = (monthIndex: number, event: React.MouseEvent) => {
        // Prevent opening edit modal if clicking on receipt icon
        if ((event.target as HTMLElement).closest('.receipt-button')) {
            return;
        }

        const existing = paymentsByMonth[monthIndex];
        if (existing) {
            setEditingPayment(existing);
            setInitialData(null);
        } else {
            setEditingPayment(null);
            // Construct expected fechaVencimiento: 1st day of that month for the selected year
            const vDate = new Date(Date.UTC(selectedYear, monthIndex, 1));
            setInitialData({
                patioTenantId: tenant?.id,
                fechaVencimiento: vDate.toISOString().split('T')[0],
                monto: tenant?.montoAlquiler || 0,
                estado: 'FUTURO',
            });
        }
        setIsEditModalOpen(true);
    };

    const getStatusColor = (payment?: PatioPayment, monthIndex?: number) => {
        if (!payment) {
            // Simple logic for future/due if no payment record exists
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();

            if (selectedYear < currentYear || (selectedYear === currentYear && monthIndex! < currentMonth)) {
                return 'error.main'; // Should have been paid
            }
            return 'grey.300'; // Future
        }

        switch (payment.estado) {
            case 'PAGADO': return 'success.main';
            case 'VENCIDO': return 'error.main';
            case 'FUTURO': return 'info.main';
            default: return 'grey.500';
        }
    };

    const handleViewReceipt = async (payment: PatioPayment, event: React.MouseEvent) => {
        event.stopPropagation();
        try {
            setIsGeneratingReceipt(true);
            if (!tenant) return;
            const dataUrl = await generatePatioReceiptPDFDataUrl(payment, tenant.nombreComercial || tenant.nombre);
            setReceiptPdfUrl(dataUrl);
            setIsReceiptModalOpen(true);
        } catch (error) {
            console.error('Error generating receipt:', error);
        } finally {
            setIsGeneratingReceipt(false);
        }
    };

    if (!tenant) return null;

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6">{tenant.nombreComercial || tenant.nombre}</Typography>
                        <Typography variant="body2" color="textSecondary">
                            {tenant.razonSocial ? `${tenant.razonSocial} · ` : ''}
                            {tenant.numerosLocales}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={() => setSelectedYear(y => y - 1)}>
                            <ChevronLeft />
                        </IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>{selectedYear}</Typography>
                        <IconButton onClick={() => setSelectedYear(y => y + 1)}>
                            <ChevronRight />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        {MONTHS.map((month, index) => {
                            const payment = paymentsByMonth[index];
                            const statusColor = getStatusColor(payment, index);

                            return (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={month}>
                                    <Card
                                        variant="outlined"
                                        sx={{
                                            height: '100%',
                                            cursor: isAdmin ? 'pointer' : 'default',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': isAdmin ? {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 3,
                                                borderColor: 'primary.main',
                                            } : {},
                                            position: 'relative',
                                            overflow: 'visible'
                                        }}
                                        onClick={(e) => isAdmin && handleEditPayment(index, e)}
                                    >
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: 4,
                                                height: '100%',
                                                bgcolor: statusColor,
                                                borderTopLeftRadius: 4,
                                                borderBottomLeftRadius: 4,
                                            }}
                                        />
                                        <CardContent sx={{ pl: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                    {month}
                                                </Typography>
                                                <Box>
                                                    {payment?.estado === 'PAGADO' && (
                                                        <Tooltip title="Generar Recibo">
                                                            <IconButton
                                                                size="small"
                                                                className="receipt-button"
                                                                onClick={(e) => handleViewReceipt(payment, e)}
                                                                disabled={isGeneratingReceipt}
                                                                sx={{ ml: 0.5, p: 0.5 }}
                                                            >
                                                                <ReceiptIcon fontSize="small" color="primary" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {payment?.notas && (
                                                        <Tooltip title="Tiene Notas">
                                                            <NotesIcon fontSize="small" color="action" sx={{ ml: 0.5 }} />
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            </Box>

                                            <Box sx={{ mt: 1 }}>
                                                {payment ? (
                                                    <>
                                                        <Typography variant="h6" color="primary.main">
                                                            S/ {payment.monto.toLocaleString()}
                                                        </Typography>
                                                        <Chip
                                                            label={payment.estado}
                                                            size="small"
                                                            sx={{
                                                                mt: 1,
                                                                bgcolor: `${statusColor}22`,
                                                                color: statusColor,
                                                                fontWeight: 600,
                                                                fontSize: '0.7rem'
                                                            }}
                                                        />
                                                        {payment.fechaPago && (
                                                            <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 0.5 }}>
                                                                Pagado el: {formatDateUTC(payment.fechaPago)}
                                                            </Typography>
                                                        )}
                                                    </>
                                                ) : (
                                                    <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', mt: 1 }}>
                                                        Pendiente / Sin info
                                                    </Typography>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} variant="outlined">Cerrar</Button>
                </DialogActions>
            </Dialog>

            <PatioPaymentEditModal
                open={isEditModalOpen}
                payment={editingPayment}
                initialData={initialData}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => {
                    // No action needed as usePatioPayments query will refetch automatically
                }}
            />

            <PentaMontReceiptModal
                open={isReceiptModalOpen}
                receiptPdfUrl={receiptPdfUrl}
                onClose={() => setIsReceiptModalOpen(false)}
            />
        </>
    );
}

import { useState } from 'react';
import {
    Box,
    Grid,
    Typography,
    Stack,
    IconButton,
    Divider,
} from '@mui/material';
import { Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { usePayments } from '../hooks/usePayments';
import { Payment, CreatePayment, PaymentStatus } from '../../../shared/types/Payment';
import type { Contract } from '../../../shared/types/Contract';
import EditPaymentModal from './EditPaymentModal';
import RoleGuard from './RoleGuard';
import { useYear } from '../contexts/YearContext';
import { usePaymentTimeline } from '../hooks/usePaymentTimeline';
import { TimelineSlot, SlotStatus } from '../domain/timeline';


export interface ContractPaymentsTimelineProps {
    contract: Contract;
}

export default function ContractPaymentsTimeline({ contract }: ContractPaymentsTimelineProps) {

    const { payments: allPayments } = usePayments();
    const { selectedYear } = useYear();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
    const [initialPaymentData, setInitialPaymentData] = useState<Partial<CreatePayment> | undefined>(undefined);

    // Use the new hook for all logic
    const timelineSlots = usePaymentTimeline({
        payments: allPayments || [],
        year: selectedYear,
        contractId: contract.id,
        tenantId: contract.tenantId || undefined,
        propertyId: contract.propertyId || undefined
    });

    const getColor = (status: SlotStatus) => {
        switch (status) {
            case 'PAID': return 'success.light';
            case 'DUE': return 'warning.light';
            case 'FUTURE': return 'grey.50';
            default: return 'grey.50';
        }
    };

    const getBorderColor = (status: SlotStatus) => {
        switch (status) {
            case 'PAID': return 'success.main';
            case 'DUE': return 'warning.main';
            case 'FUTURE': return 'grey.500';
            default: return 'grey.500';
        }
    };

    const getStatusLabel = (status: SlotStatus) => {
        switch (status) {
            case 'PAID': return 'Pagado';
            case 'DUE': return 'Impago';
            case 'FUTURE': return 'Futuro';
            default: return 'Futuro';
        }
    };

    const getStatusColor = (status: SlotStatus) => {
        switch (status) {
            case 'PAID': return 'success.dark';
            case 'DUE': return 'warning.dark';
            case 'FUTURE': return 'text.secondary';
            default: return 'text.secondary';
        }
    };

    const handleSlotClick = (slot: TimelineSlot) => {
        if (slot.payment && slot.payment.id !== 0) {
            // Edit existing payment
            setEditingPayment(slot.payment);
            setInitialPaymentData(undefined);
            setEditDialogOpen(true);
        } else {
            // Create new payment for this month slot
            const dueDate = new Date(selectedYear, slot.monthNumber - 1, 1);
            const paymentDate = new Date();

            setEditingPayment(null);
            setInitialPaymentData({
                tenantId: contract.tenantId || undefined,
                propertyId: contract.propertyId || undefined,
                contractId: contract.id,
                monthNumber: slot.monthNumber,
                amount: contract.monthlyRent,
                dueDate: dueDate.toISOString().split('T')[0],
                paymentDate: paymentDate.toISOString().split('T')[0],
                status: PaymentStatus.PAGADO, // Default for new payment
            });
            setEditDialogOpen(true);
        }
    };

    const handleEditSuccess = async () => {
        setEditDialogOpen(false);
        setEditingPayment(null);
        setInitialPaymentData(undefined);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    return (
        <>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2">
                    Estado de cuotas ({selectedYear})
                </Typography>
            </Box>

            <Grid container spacing={1.2}>
                {timelineSlots.map((slot) => {
                    const gridKey = `${contract.id}-${slot.year}-${slot.monthNumber}-${slot.status}`;

                    return (
                        <Grid item xs={4} sm={3} md={2} key={gridKey}>
                            <Box
                                onClick={() => handleSlotClick(slot)}
                                sx={{
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: getBorderColor(slot.status),
                                    bgcolor: getColor(slot.status),
                                    px: 1.5,
                                    py: 2,
                                    textAlign: 'center',
                                    minHeight: 110,
                                    height: 110,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    width: '100%',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    }
                                }}
                            >
                                <RoleGuard allowedRoles={['ADMIN']}>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSlotClick(slot);
                                        }}
                                        sx={{
                                            position: 'absolute',
                                            bottom: 4,
                                            right: 4,
                                            bgcolor: 'background.paper',
                                            boxShadow: 1,
                                            '&:hover': {
                                                bgcolor: 'primary.light',
                                                color: 'primary.contrastText'
                                            }
                                        }}
                                    >
                                        {!slot.isMissing ? <EditIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                                    </IconButton>
                                </RoleGuard>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        display: 'block',
                                        fontWeight: 800,
                                        color: 'grey.900',
                                        lineHeight: 1.15,
                                        fontSize: '1.15rem',
                                        letterSpacing: 0.2,
                                        wordBreak: 'break-word'
                                    }}
                                >
                                    Mes {slot.monthNumber} · {slot.monthLabel.split(' ')[0]}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 800,
                                        color: getStatusColor(slot.status),
                                        mt: 0.7,
                                        fontSize: '1.05rem',
                                        letterSpacing: 0.2
                                    }}
                                >
                                    {getStatusLabel(slot.status)}
                                </Typography>
                                {slot.payment && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            mt: 0.5,
                                            fontSize: '0.75rem',
                                            color: 'text.secondary'
                                        }}
                                    >
                                        {formatCurrency((contract?.monthlyRent ?? slot.payment.amount) || 0)}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>

            <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 16, height: 16, bgcolor: getColor('PAID'), borderRadius: 0.6, border: '1px solid', borderColor: getBorderColor('PAID') }} />
                    <Typography variant="body2" sx={{ fontSize: '1rem' }}>Pagado</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 16, height: 16, bgcolor: getColor('DUE'), borderRadius: 0.6, border: '1px solid', borderColor: getBorderColor('DUE') }} />
                    <Typography variant="body2" sx={{ fontSize: '1rem' }}>Impago</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 16, height: 16, bgcolor: getColor('FUTURE'), borderRadius: 0.6, border: '1px solid', borderColor: getBorderColor('FUTURE') }} />
                    <Typography variant="body2" sx={{ fontSize: '1rem' }}>Futuro</Typography>
                </Stack>
            </Stack>

            <EditPaymentModal
                open={editDialogOpen}
                payment={editingPayment}
                initialData={initialPaymentData}
                onClose={() => {
                    setEditDialogOpen(false);
                    setEditingPayment(null);
                    setInitialPaymentData(undefined);
                }}
                onSuccess={handleEditSuccess}
            />
        </>
    );
}

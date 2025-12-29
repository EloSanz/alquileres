import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Typography,
  Stack,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { usePaymentService } from '../services/paymentService';
import { Payment } from '../../../shared/types/Payment';
import { buildContractTimeline, type ContractMonthInfo } from '../services/contractTimeline';
import type { Contract } from '../../../shared/types/Contract';
import EditPaymentModal from './EditPaymentModal';

export interface PaymentByPropertyDetailsModalProps {
  open: boolean;
  contract: Contract | null;
  onClose: () => void;
}

type MonthStatus = 'PAID' | 'DUE' | 'FUTURE';

export default function PaymentByPropertyDetailsModal({
  open,
  contract,
  onClose
}: PaymentByPropertyDetailsModalProps) {
  const paymentService = usePaymentService();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsVersion, setPaymentsVersion] = useState(0); // Versión para forzar re-render
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()); // Año actual por defecto
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  // Función explícita para cargar pagos del contrato
  const loadPayments = useCallback(async () => {
    if (!contract || !contract.tenantId) return;
    try {
      setError('');
      const contractId = contract.id;
      const tenantId = contract.tenantId;
      
      const tenantPayments = await paymentService.getPaymentsByTenantId(tenantId);
      
      const byContract = tenantPayments.filter(p => p.contractId === contractId);
      
      // Crear un nuevo array con nuevas referencias de objetos para forzar actualización
      const newPayments = byContract.map(p => Payment.fromJSON(p.toJSON()));
      
      setPayments(newPayments);
      // Incrementar versión para forzar re-render del timeline
      setPaymentsVersion(prev => prev + 1);
    } catch (e: any) {
      console.error('[PaymentByPropertyDetailsModal] Error al cargar pagos:', e);
      setError(e?.message || 'Error al cargar pagos del contrato');
      setPayments([]);
    }
    // paymentService es estable dentro del hook, no necesita estar en dependencias
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract?.id, contract?.tenantId]);

  useEffect(() => {
    if (open && contract?.id && contract?.tenantId) {
      loadPayments();
    } else if (!open) {
      // Limpiar pagos cuando se cierra el modal
      setPayments([]);
      setPaymentsVersion(0);
    }
  }, [open, contract?.id, contract?.tenantId, loadPayments]);

  // Filtrar pagos por año seleccionado usando dueDate
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const dueDate = new Date(p.dueDate);
      return dueDate.getFullYear() === selectedYear;
    });
  }, [payments, selectedYear]);

  const timeline = useMemo<ContractMonthInfo[]>(() => {
    if (!contract) return [];
    // Siempre construir el timeline completo para el año seleccionado
    // paymentsVersion fuerza la recalculación cuando cambia
    return buildContractTimeline(selectedYear, filteredPayments);
  }, [filteredPayments, paymentsVersion, selectedYear, contract?.id]);

  const getPaymentByMonth = (monthNumber: number): Payment | undefined => {
    // Buscar en los pagos filtrados por año
    return filteredPayments.find(p => {
      const dueDate = new Date(p.dueDate);
      const month = dueDate.getMonth() + 1; // getMonth() retorna 0-11, necesitamos 1-12
      return month === monthNumber;
    });
  };

  const getColor = (status?: MonthStatus) => {
    switch (status) {
      case 'PAID':
        return 'success.light';
      case 'DUE':
        return 'warning.light';
      case 'FUTURE':
      default:
        return 'grey.50';
    }
  };

  const getBorderColor = (status?: MonthStatus) => {
    switch (status) {
      case 'PAID':
        return 'success.main';
      case 'DUE':
        return 'warning.main';
      case 'FUTURE':
      default:
        return 'grey.500';
    }
  };

  const getStatusLabel = (status?: MonthStatus) => {
    switch (status) {
      case 'PAID':
        return 'Pagado';
      case 'DUE':
        return 'Impago';
      case 'FUTURE':
      default:
        return 'Futuro';
    }
  };

  const getStatusColor = (status?: MonthStatus) => {
    switch (status) {
      case 'PAID':
        return 'success.dark';
      case 'DUE':
        return 'warning.dark';
      case 'FUTURE':
      default:
        return 'text.secondary';
    }
  };

  const handleEditClick = (monthInfo: ContractMonthInfo) => {
    const payment = getPaymentByMonth(monthInfo.monthNumber);
    
    if (payment && payment.id !== 0) {
      // Editar pago existente - solo para pagos con id !== 0
      setEditingPayment(payment);
      setEditDialogOpen(true);
    }
    // Nota: La creación de nuevos pagos se maneja en otro lugar si es necesario
  };

  const handleEditSuccess = async () => {
    // Recargar pagos después de editar exitosamente
    await loadPayments();
    setEditDialogOpen(false);
    setEditingPayment(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          Pagos del Local {contract ? `N° ${contract.propertyLocalNumber || 'N/A'}` : ''}
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <Typography variant="body2">
              Inquilino: <strong>{contract?.tenantFullName || `ID: ${contract?.tenantId}`}</strong>
            </Typography>
            <Typography variant="body2">
              Local: <strong>{contract?.propertyName} </strong>
              {contract?.propertyLocalNumber !== undefined && (
                <Box component="span" sx={{ color: 'text.secondary', ml: 1 }}>
                  / N° {contract.propertyLocalNumber}
                </Box>
              )}
            </Typography>
            <Typography variant="body2">
              Periodo: <strong>desde enero</strong>
            </Typography>
            <Typography variant="body2">
              Alquiler Mensual: <strong>{formatCurrency(contract?.monthlyRent || 0)}</strong>
            </Typography>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2">
              Estado de cuotas (12 meses)
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Año</InputLabel>
              <Select
                value={selectedYear}
                label="Año"
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                <MenuItem value={2025}>2025</MenuItem>
                <MenuItem value={2026}>2026</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Grid container spacing={1.2}>
            {timeline.map((mi) => {
              const status = mi.status as MonthStatus;
              const payment = getPaymentByMonth(mi.monthNumber);
              
              // Key incluye monthNumber, status, paymentId y updatedAt para forzar re-render cuando cambie cualquier cosa
              const gridKey = `${mi.monthNumber}-${status}-${payment?.id || 'none'}-${payment?.updatedAt || 'no-payment'}`;
              
              return (
                <Grid item xs={4} sm={3} md={2} key={gridKey}>
                  <Box
                    key={`box-${gridKey}`}
                    onClick={() => handleEditClick(mi)}
                    sx={{
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: getBorderColor(status),
                      bgcolor: getColor(status),
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
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(mi);
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
                      <EditIcon fontSize="small" />
                    </IconButton>
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
                      Mes {mi.monthNumber} · {mi.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 800,
                        color: getStatusColor(status),
                        mt: 0.7,
                        fontSize: '1.05rem',
                        letterSpacing: 0.2
                      }}
                    >
                      {getStatusLabel(status)}
                    </Typography>
                    {payment && (
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 0.5,
                          fontSize: '0.75rem',
                          color: 'text.secondary'
                        }}
                      >
                        {formatCurrency(payment.amount)}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Payment Modal - solo para pagos existentes (id !== 0) */}
      {editingPayment && editingPayment.id !== 0 && (
        <EditPaymentModal
          open={editDialogOpen}
          payment={editingPayment}
          onClose={() => {
            setEditDialogOpen(false);
            setEditingPayment(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}


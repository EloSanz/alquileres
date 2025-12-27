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
  Dialog as EditDialog,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { usePaymentService } from '../services/paymentService';
import { Payment, UpdatePayment, CreatePayment, PaymentStatus } from '../../../shared/types/Payment';
import { buildContractTimeline, type ContractMonthInfo } from '../services/contractTimeline';
import type { Contract } from '../../../shared/types/Contract';

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
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editForm, setEditForm] = useState({
    amount: '',
    paymentDate: '',
    dueDate: '',
    paymentMethod: 'YAPE',
    status: PaymentStatus.FUTURO,
    notes: '',
  });

  // Función explícita para cargar pagos del contrato
  const loadPayments = useCallback(async () => {
    if (!contract || !contract.tenantId) return;
    try {
      setError('');
      const contractId = contract.id;
      const tenantId = contract.tenantId;
      console.log('[PaymentByPropertyDetailsModal] loadPayments iniciado', { contractId, tenantId });
      
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

  const timeline = useMemo<ContractMonthInfo[]>(() => {
    if (!contract) return [];
    // Siempre construir el timeline completo, incluso si no hay pagos aún
    // paymentsVersion fuerza la recalculación cuando cambia
    return buildContractTimeline(contract.startDate, payments);
  }, [payments, paymentsVersion, contract?.startDate, contract?.id]);

  const getPaymentByMonth = (monthNumber: number): Payment | undefined => {
    return payments.find(p => p.monthNumber === monthNumber);
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
    
    if (payment) {
      // Editar pago existente
      setEditingPayment(payment);
      setEditForm({
        amount: payment.amount.toString(),
        paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
        dueDate: new Date(payment.dueDate).toISOString().split('T')[0],
        paymentMethod: payment.paymentMethod || 'YAPE',
        status: payment.status || PaymentStatus.FUTURO,
        notes: payment.notes || '',
      });
    } else {
      // Crear nuevo pago para este mes
      if (!contract) return;
      
      // Calcular fecha de vencimiento (día 5 del mes)
      const dueDate = new Date(monthInfo.dueDate);
      dueDate.setDate(5);
      
      // Crear pago temporal para edición
      const tempPayment = {
        id: 0,
        tenantId: contract.tenantId,
        propertyId: contract.propertyId,
        contractId: contract.id,
        monthNumber: monthInfo.monthNumber,
        tenantFullName: contract.tenantFullName,
        tenantPhone: null,
        amount: contract.monthlyRent || 0,
        paymentDate: new Date(dueDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 días antes
        dueDate: dueDate.toISOString().split('T')[0],
        paymentMethod: 'YAPE',
        status: PaymentStatus.PAGADO,
        pentamontSettled: false,
        notes: null,
        receiptImageUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setEditingPayment(tempPayment as Payment);
      setEditForm({
        amount: tempPayment.amount.toString(),
        paymentDate: tempPayment.paymentDate,
        dueDate: tempPayment.dueDate,
        paymentMethod: tempPayment.paymentMethod,
        status: tempPayment.status || PaymentStatus.FUTURO,
        notes: '',
      });
    }
    setEditDialogOpen(true);
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment || !contract) return;

    try {
      if (editingPayment.id === 0) {
        // Crear nuevo pago
        const createPaymentData = new CreatePayment(
          editingPayment.tenantId!,
          editingPayment.propertyId!,
          parseFloat(editForm.amount),
          editForm.dueDate,
          editForm.paymentDate,
          editForm.paymentMethod,
          editForm.status, // Usar el estado seleccionado
          editingPayment.pentamontSettled,
          editForm.notes || undefined
        );
        
        // Agregar contractId y monthNumber al objeto antes de enviar
        const paymentPayload = {
          ...createPaymentData.toJSON(),
          contractId: contract.id,
          monthNumber: editingPayment.monthNumber,
        };
        
        await paymentService.createPayment(paymentPayload as any);
      } else {
        // Actualizar pago existente
        // Solo pasar campos editables - el backend recalculará el status automáticamente
        const paymentData = new UpdatePayment(
          undefined, // tenantId - no editable
          undefined, // propertyId - no editable
          undefined, // contractId - no editable
          undefined, // monthNumber - no editable
          undefined, // tenantFullName - no editable
          undefined, // tenantPhone - no editable
          parseFloat(editForm.amount),
          editForm.paymentDate,
          editForm.dueDate,
          editForm.paymentMethod,
          undefined, // status - se recalculará automáticamente basado en fechas
          editingPayment.pentamontSettled,
          editForm.notes || undefined
        );

        await paymentService.updatePayment(editingPayment.id, paymentData);
      }
      
      // Recargar pagos para reflejar los cambios en el grid
      await loadPayments();

      // Cerrar el diálogo después de asegurar que el estado se actualizó
      setEditDialogOpen(false);
      setEditingPayment(null);
      setEditForm({
        amount: '',
        paymentDate: '',
        dueDate: '',
        paymentMethod: 'YAPE',
        status: PaymentStatus.FUTURO,
        notes: '',
      });
      // Limpiar cualquier error previo después de éxito
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to save payment');
      // No cerrar el diálogo si hay error para que el usuario pueda corregir
    }
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
              Periodo:{' '}
              <strong>
                {contract?.startDate ? new Date(contract.startDate).toLocaleDateString() : '-'}
              </strong>{' '}
              →{' '}
              <strong>
                {contract?.endDate ? new Date(contract.endDate).toLocaleDateString() : '-'}
              </strong>
            </Typography>
            <Typography variant="body2">
              Alquiler Mensual: <strong>{formatCurrency(contract?.monthlyRent || 0)}</strong>
            </Typography>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Estado de cuotas (12 meses)
          </Typography>
          <Grid container spacing={1.2}>
            {timeline.map((mi) => {
              const status = mi.status as MonthStatus;
              const payment = getPaymentByMonth(mi.monthNumber);
              
              // Key incluye monthNumber y status para forzar re-render cuando cambie el status
              const gridKey = `${mi.monthNumber}-${status}-${payment?.id || 'none'}`;
              
              return (
                <Grid item xs={4} sm={3} md={2} key={gridKey}>
                  <Box
                    key={`box-${gridKey}`}
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

      {/* Edit Payment Dialog */}
      <EditDialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingPayment?.id === 0 ? 'Crear Pago' : 'Editar Pago'}</DialogTitle>
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
              label="Estado del Pago"
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
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleUpdatePayment} variant="contained">
            {editingPayment?.id === 0 ? 'Crear' : 'Actualizar'}
          </Button>
        </DialogActions>
      </EditDialog>
    </>
  );
}


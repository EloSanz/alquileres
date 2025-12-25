import { useEffect, useMemo, useState } from 'react';
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
  Divider
} from '@mui/material';
import { usePaymentService, type Payment } from '../services/paymentService';
import type { Contract } from '../services/contractService';

export interface ContractDetailsModalProps {
  open: boolean;
  contract: Contract | null;
  onClose: () => void;
}

type MonthStatus = 'PAID' | 'DUE' | 'FUTURE';

export default function ContractDetailsModal({
  open,
  contract,
  onClose
}: ContractDetailsModalProps) {
  const paymentService = usePaymentService();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!contract) return;
      try {
        setLoading(true);
        setError('');
        const all = await paymentService.getAllPayments();
        const byContract = all.filter(p => p.contractId === contract.id);
        setPayments(byContract);
      } catch (e: any) {
        setError(e?.message || 'Error al cargar pagos del contrato');
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    if (open) load();
  }, [open, contract?.id]);

  const monthStatuses = useMemo(() => {
    const statuses: Record<number, MonthStatus> = {};
    if (!contract) return statuses;
    const now = new Date();
    // Map existing payments by monthNumber si existe
    const byMonth = new Map<number, Payment>();
    for (const p of payments) {
      if (p.monthNumber != null) byMonth.set(p.monthNumber, p);
    }
    for (let m = 1; m <= 12; m++) {
      const p = byMonth.get(m);
      if (p) {
        if (p.paymentDate && new Date(p.paymentDate) <= now) {
          statuses[m] = 'PAID';
        } else if (new Date(p.dueDate) < now) {
          statuses[m] = 'DUE';
        } else {
          statuses[m] = 'FUTURE';
        }
      } else {
        // Si no hay registro, inferir por fecha relativa al startDate
        const startDate = new Date(contract.startDate);
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + (m - 1));
        if (dueDate < now) {
          statuses[m] = 'DUE';
        } else {
          statuses[m] = 'FUTURE';
        }
      }
    }
    return statuses;
  }, [payments, contract]);

  const getColor = (status?: MonthStatus) => {
    switch (status) {
      case 'PAID':
        return 'success.light';
      case 'DUE':
        return 'warning.light'; // amarillo
      case 'FUTURE':
      default:
        return 'grey.300'; // gris
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
        return 'grey.400';
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Detalle del Contrato {contract ? `#${contract.id}` : ''}
      </DialogTitle>
      <DialogContent dividers>
        {/* Helpers */}
        {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
        {null}
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
            Local: <strong>{contract?.propertyName || `ID: ${contract?.propertyId}`}</strong>
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
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Estado de cuotas (12 meses)
        </Typography>
        <Grid container spacing={1.2}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
            const status = monthStatuses[m];
            return (
              <Grid item xs={4} sm={3} md={2} key={m}>
                <Box
                  sx={{
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: getBorderColor(status),
                    bgcolor: getColor(status),
                    px: 1.25,
                    py: 1.5,
                    textAlign: 'center',
                    minHeight: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ display: 'block', fontWeight: 700, color: 'text.primary', lineHeight: 1.1 }}
                  >
                    Mes {m}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: getStatusColor(status), mt: 0.25 }}
                  >
                    {getStatusLabel(status)}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 14, height: 14, bgcolor: getColor('PAID'), borderRadius: 0.5, border: '1px solid', borderColor: getBorderColor('PAID') }} />
            <Typography variant="caption">Pagado</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 14, height: 14, bgcolor: getColor('DUE'), borderRadius: 0.5, border: '1px solid', borderColor: getBorderColor('DUE') }} />
            <Typography variant="caption">Impago</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 14, height: 14, bgcolor: getColor('FUTURE'), borderRadius: 0.5, border: '1px solid', borderColor: getBorderColor('FUTURE') }} />
            <Typography variant="caption">Futuro</Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}



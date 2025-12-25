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
import { buildContractTimeline, type ContractMonthInfo } from '../services/contractTimeline';
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
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!contract) return;
      try {
        setError('');
        const all = await paymentService.getAllPayments();
        const byContract = all.filter(p => p.contractId === contract.id);
        setPayments(byContract);
      } catch (e: any) {
        setError(e?.message || 'Error al cargar pagos del contrato');
        setPayments([]);
      } finally {
        // no-op
      }
    };
    if (open) load();
  }, [open, contract?.id]);

  const timeline = useMemo<ContractMonthInfo[]>(() => {
    if (!contract) return [];
    return buildContractTimeline(contract.startDate, payments);
  }, [payments, contract]);

  const getColor = (status?: MonthStatus) => {
    switch (status) {
      case 'PAID':
        return 'success.light';
      case 'DUE':
        return 'warning.light'; // amarillo
      case 'FUTURE':
      default:
        return 'grey.50'; // gris aún más claro para mejor contraste
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
          {timeline.map((mi) => {
            const status = mi.status as MonthStatus;
            return (
              <Grid item xs={4} sm={3} md={2} key={mi.monthNumber}>
                <Box
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
                    width: '100%'
                  }}
                >
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
  );
}



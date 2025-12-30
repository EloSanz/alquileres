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
import { usePayments } from '../hooks/usePayments';
import type { Payment } from '../../../shared/types/Payment';
import { buildContractTimeline, type ContractMonthInfo } from '../services/contractTimeline';
import type { Contract } from '../../../shared/types/Contract';

// Función para formatear fecha a DD/MM/YYYY
const formatDateDisplay = (date: Date | string | null | undefined): string => {
  if (!date) return '-';
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return String(date);
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

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
  const { payments: allPayments } = usePayments();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!contract || !allPayments) {
      setPayments([]);
      return;
    }
    const byContract = allPayments.filter(p => p.contractId === contract.id);
    setPayments(byContract);
  }, [contract, allPayments]);

  const timeline = useMemo<ContractMonthInfo[]>(() => {
    if (!contract) return [];
    // Usar el año del startDate del contrato
    const contractYear = contract.startDate instanceof Date
      ? contract.startDate.getFullYear()
      : new Date(contract.startDate).getFullYear();

    // Filtrar pagos por año del contrato
    const filteredPayments = payments.filter(p => {
      const dueDate = new Date(p.dueDate);
      return dueDate.getFullYear() === contractYear;
    });

    return buildContractTimeline(contractYear, filteredPayments);
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
      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Helpers */}
        {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
        {null}

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
              {formatDateDisplay(contract?.startDate)}
            </strong>{' '}
            →{' '}
            <strong>
              {formatDateDisplay(contract?.endDate)}
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



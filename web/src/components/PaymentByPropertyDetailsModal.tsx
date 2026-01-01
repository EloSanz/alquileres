import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  CircularProgress,
} from '@mui/material';
import { usePayments } from '../hooks/usePayments';
import type { Contract } from '../../../shared/types/Contract';
import ContractPaymentsTimeline from './ContractPaymentsTimeline';

export interface PaymentByPropertyDetailsModalProps {
  open: boolean;
  contract: Contract | null;
  onClose: () => void;
}

export default function PaymentByPropertyDetailsModal({
  open,
  contract,
  onClose
}: PaymentByPropertyDetailsModalProps) {
  const { isLoading } = usePayments();

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
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CircularProgress size={24} />
            </Box>
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

          {contract && <ContractPaymentsTimeline contract={contract} />}

        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

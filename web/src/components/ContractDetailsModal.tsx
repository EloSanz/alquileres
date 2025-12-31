import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
} from '@mui/material';
import type { Contract } from '../../../shared/types/Contract';
import ContractPaymentsTimeline from './ContractPaymentsTimeline';

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

export default function ContractDetailsModal({
  open,
  contract,
  onClose
}: ContractDetailsModalProps) {

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Detalle del Contrato {contract ? `#${contract.id}` : ''}
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
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

        {contract && <ContractPaymentsTimeline contract={contract} />}

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}



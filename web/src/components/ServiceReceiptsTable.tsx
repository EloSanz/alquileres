import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { useServiceReceipts, ServiceReceipt } from '../hooks/useServiceReceipts';
import ServiceReceiptDetailModal from './ServiceReceiptDetailModal';

export default function ServiceReceiptsTable() {
  const { receipts, isLoading } = useServiceReceipts();
  const [selected, setSelected] = useState<ServiceReceipt | null>(null);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (receipts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography color="text.secondary">No hay recibos registrados todavía.</Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Inquilino</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Monto</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Origen</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Comprobante</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {receipts.map((r) => (
              <TableRow
                key={r.id}
                hover
                onClick={() => setSelected(r)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  {new Date(r.paymentDate + 'T00:00:00Z').toLocaleDateString('es-PE', {
                    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
                  })}
                </TableCell>
                <TableCell>
                  <Chip
                    label={r.categoryLabel || r.categoryName || '-'}
                    size="small"
                    color={r.categoryName === 'AGUA' ? 'info' : 'warning'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {r.tenantName || <Typography variant="body2" color="text.disabled">—</Typography>}
                </TableCell>
                <TableCell>
                  {r.amount != null
                    ? new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(r.amount)
                    : <Typography variant="body2" color="text.disabled">—</Typography>
                  }
                </TableCell>
                <TableCell>
                  <Chip
                    label={r.kind === 'GENERATED' ? 'Generado' : 'Cargado'}
                    size="small"
                    color={r.kind === 'GENERATED' ? 'success' : 'default'}
                    variant="filled"
                  />
                </TableCell>
                <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                  {r.receiptImageUrl ? (
                    <Tooltip title="Ver comprobante">
                      <IconButton
                        size="small"
                        href={r.receiptImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        component="a"
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.disabled">—</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ServiceReceiptDetailModal
        receipt={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Payment } from '../../../shared/types/Payment';
import { formatDateLocal } from '../utils/dateUtils';

export interface PaymentTableProps {
  payments: Payment[];
  onEdit: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
  onTogglePentamont: (payment: Payment) => void;
  onPaymentClick: (payment: Payment) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount);
};

export default function PaymentTable({
  payments,
  onEdit,
  onDelete,
  onTogglePentamont,
  onPaymentClick,
}: PaymentTableProps) {
  return (
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Inquilino</strong></TableCell>
            <TableCell><strong>Monto</strong></TableCell>
            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><strong>Fecha Pago</strong></TableCell>
            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><strong>Fecha Vencimiento</strong></TableCell>
            <TableCell><strong>Medio de Pago</strong></TableCell>
            <TableCell align="center"><strong>Acciones</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payments.map((payment) => (
            <TableRow 
              key={payment.id} 
              hover
              onClick={() => onPaymentClick(payment)}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.12)'
                }
              }}
            >
              <TableCell>{payment.tenantFullName || `ID: ${payment.tenantId}`}</TableCell>
              <TableCell>{formatCurrency(payment.amount)}</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{formatDateLocal(payment.paymentDate)}</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{formatDateLocal(payment.dueDate)}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    {payment.paymentMethod === 'YAPE' ? 'Yape' :
                     payment.paymentMethod === 'DEPOSITO' ? 'Depósito' :
                     payment.paymentMethod === 'TRANSFERENCIA_VIRTUAL' ? 'Transferencia Virtual' :
                     payment.paymentMethod}
                  </Typography>
                  {payment.paymentMethod === 'YAPE' && (
                    <FormControlLabel
                      sx={{ ml: 1 }}
                      label={`Pentamont: ${payment.pentamontSettled ? 'Sí' : 'No'}`}
                      control={
                        <Switch
                          size="small"
                          checked={!!payment.pentamontSettled}
                          onChange={(e) => {
                            e.stopPropagation();
                            onTogglePentamont(payment);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </Box>
              </TableCell>
              <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(payment);
                  }}
                  title="Editar"
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(payment);
                  }}
                  title="Eliminar"
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {payments.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No hay pagos registrados
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}


import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
} from '@mui/material';
import { FreeBreakfast as ReleaseIcon, Close as CloseIcon } from '@mui/icons-material';

interface AssociatedProperty {
  id: number;
  name: string;
  address: string;
  city: string;
}

interface Tenant {
  id: number;
  firstName: string;
  lastName: string;
}

interface AssociatedPayment {
  id: number;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: string;
  paymentType: string;
}

interface TenantDeletionModalProps {
  open: boolean;
  tenant: Tenant | null;
  properties: AssociatedProperty[];
  payments: AssociatedPayment[];
  onPropertyRelease: (propertyId: number) => Promise<void>;
  onPaymentCancellation: (paymentId: number) => Promise<void>;
  onClose: () => void;
  onRefresh?: () => void;
}

const TenantDeletionModal: React.FC<TenantDeletionModalProps> = ({
  open,
  tenant,
  properties,
  payments,
  onPropertyRelease,
  onPaymentCancellation,
  onClose,
  onRefresh,
}) => {
  const [releasingProperties, setReleasingProperties] = useState<Set<number>>(new Set());
  const [releasedProperties, setReleasedProperties] = useState<Set<number>>(new Set());
  const [cancellingPayments, setCancellingPayments] = useState<Set<number>>(new Set());
  const [cancelledPayments, setCancelledPayments] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string>('');

  const handlePropertyRelease = async (propertyId: number) => {
    if (releasingProperties.has(propertyId)) return;

    setReleasingProperties(prev => new Set(prev).add(propertyId));
    setError('');

    try {
      await onPropertyRelease(propertyId);
      setReleasedProperties(prev => new Set(prev).add(propertyId));
      setReleasingProperties(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });

      // Refresh data if callback provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      setError(err.message || 'Error al liberar la propiedad');
      setReleasingProperties(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
    }
  };

  const handlePaymentCancellation = async (paymentId: number) => {
    if (cancellingPayments.has(paymentId)) return;

    setCancellingPayments(prev => new Set(prev).add(paymentId));
    setError('');

    try {
      await onPaymentCancellation(paymentId);
      setCancelledPayments(prev => new Set(prev).add(paymentId));
      setCancellingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(paymentId);
        return newSet;
      });
    } catch (err: any) {
      setError(err.message || 'Error al cancelar el pago');
      setCancellingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(paymentId);
        return newSet;
      });
    }
  };

  const handleClose = () => {
    setReleasingProperties(new Set());
    setReleasedProperties(new Set());
    setCancellingPayments(new Set());
    setCancelledPayments(new Set());
    setError('');
    onClose();
  };

  const allPropertiesReleased = properties.length > 0 && properties.every(p => releasedProperties.has(p.id));
  const allPaymentsCancelled = payments.length > 0 && payments.every(p => cancelledPayments.has(p.id));
  const allActionsCompleted = (properties.length === 0 || allPropertiesReleased) && (payments.length === 0 || allPaymentsCancelled);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          No se puede eliminar el inquilino
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          El inquilino{' '}
          <strong>
            {tenant?.firstName} {tenant?.lastName}
          </strong>{' '}
          tiene elementos asociados que deben ser gestionados antes de poder eliminarlo:
        </Typography>

        {properties.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mb: 1, color: 'warning.main' }}>
              🏠 Propiedades ({properties.length})
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Estas propiedades serán liberadas (quedarán disponibles para otros inquilinos).
            </Typography>
          </>
        )}

        {payments.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mb: 1, color: 'error.main' }}>
              💰 Pagos ({payments.length})
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Estos pagos serán cancelados antes de eliminar el inquilino.
            </Typography>
          </>
        )}

        {properties.length > 0 && (
          <TableContainer component={Paper} sx={{ mt: 2, mb: payments.length > 0 ? 3 : 0 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Nombre</strong></TableCell>
                  <TableCell><strong>Dirección</strong></TableCell>
                  <TableCell><strong>Ciudad</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Acción</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>{property.id}</TableCell>
                    <TableCell>{property.name}</TableCell>
                    <TableCell>{property.address}</TableCell>
                    <TableCell>{property.city}</TableCell>
                    <TableCell>
                      {releasedProperties.has(property.id) ? (
                        <Alert severity="success" sx={{ py: 0, px: 1 }}>
                          Liberada
                        </Alert>
                      ) : releasingProperties.has(property.id) ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Typography color="text.secondary">
                          Asignada
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        startIcon={
                          releasingProperties.has(property.id) ? (
                            <CircularProgress size={16} />
                          ) : (
                            <ReleaseIcon />
                          )
                        }
                        onClick={() => handlePropertyRelease(property.id)}
                        disabled={releasingProperties.has(property.id) || releasedProperties.has(property.id)}
                      >
                        {releasedProperties.has(property.id) ? 'Liberada' : 'Liberar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {payments.length > 0 && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Monto</strong></TableCell>
                  <TableCell><strong>Fecha de Pago</strong></TableCell>
                  <TableCell><strong>Fecha de Vencimiento</strong></TableCell>
                  <TableCell><strong>Tipo</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Acción</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.id}</TableCell>
                    <TableCell>S/ {payment.amount}</TableCell>
                    <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{payment.paymentType}</TableCell>
                    <TableCell>
                      {cancelledPayments.has(payment.id) ? (
                        <Alert severity="error" sx={{ py: 0, px: 1 }}>
                          Cancelado
                        </Alert>
                      ) : cancellingPayments.has(payment.id) ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Chip
                          label={payment.status}
                          color={payment.status === 'COMPLETED' ? 'success' : payment.status === 'PENDING' ? 'warning' : 'error'}
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={
                          cancellingPayments.has(payment.id) ? (
                            <CircularProgress size={16} />
                          ) : (
                            <CloseIcon />
                          )
                        }
                        onClick={() => handlePaymentCancellation(payment.id)}
                        disabled={cancellingPayments.has(payment.id) || cancelledPayments.has(payment.id)}
                      >
                        {cancelledPayments.has(payment.id) ? 'Cancelado' : 'Cancelar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {allActionsCompleted && (
          <Alert severity="success" sx={{ mt: 2 }}>
            ✅ Todas las propiedades han sido liberadas y todos los pagos han sido cancelados.
            Ahora puedes intentar eliminar el inquilino nuevamente.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
          ⚠️ Liberar una propiedad la dejará disponible para ser asignada a otros inquilinos.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          {allActionsCompleted ? 'Cerrar' : 'Cancelar'}
        </Button>
        {allActionsCompleted && (
          <Button
            onClick={() => {
              handleClose();
              // Aquí podrías agregar lógica para intentar eliminar el tenant nuevamente
            }}
            variant="contained"
            color="error"
          >
            Intentar Eliminar Inquilino
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TenantDeletionModal;

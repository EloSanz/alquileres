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

interface TenantDeletionModalProps {
  open: boolean;
  tenant: Tenant | null;
  properties: AssociatedProperty[];
  onPropertyRelease: (propertyId: number) => Promise<void>;
  onClose: () => void;
  onRefresh?: () => void;
}

const TenantDeletionModal: React.FC<TenantDeletionModalProps> = ({
  open,
  tenant,
  properties,
  onPropertyRelease,
  onClose,
  onRefresh,
}) => {
  const [releasingProperties, setReleasingProperties] = useState<Set<number>>(new Set());
  const [releasedProperties, setReleasedProperties] = useState<Set<number>>(new Set());
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

  const handleClose = () => {
    setReleasingProperties(new Set());
    setReleasedProperties(new Set());
    setError('');
    onClose();
  };

  const allPropertiesReleased = properties.length > 0 && properties.every(p => releasedProperties.has(p.id));

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
          tiene {properties.length} propiedad{properties.length !== 1 ? 'es' : ''} asociada{properties.length !== 1 ? 's' : ''} que deben ser liberadas antes de poder eliminarlo.
        </Typography>

        {properties.length > 0 && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
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

        {allPropertiesReleased && (
          <Alert severity="success" sx={{ mt: 2 }}>
            ✅ Todas las propiedades han sido liberadas. Ahora puedes intentar eliminar el inquilino nuevamente.
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
          {allPropertiesReleased ? 'Cerrar' : 'Cancelar'}
        </Button>
        {allPropertiesReleased && (
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

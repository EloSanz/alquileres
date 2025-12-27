import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import type { Property } from '../../../shared/types/Property';

export interface PropertyDetailsModalProps {
  open: boolean;
  property: Property | null;
  onClose: () => void;
}

export default function PropertyDetailsModal({
  open,
  property,
  onClose
}: PropertyDetailsModalProps) {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  const getUbicacionLabel = (ubicacion: string) => {
    switch (ubicacion) {
      case 'BOULEVARD':
        return 'Boulevard';
      case 'SAN_MARTIN':
        return 'San Martin';
      default:
        return ubicacion;
    }
  };

  const getPropertyTypeLabel = (propertyType: string) => {
    switch (propertyType) {
      case 'INSIDE':
        return 'Adentro';
      case 'OUTSIDE':
        return 'Afuera';
      default:
        return propertyType;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Activa';
      case 'INACTIVE':
        return 'Inactiva';
      case 'ARCHIVED':
        return 'Archivada';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'warning';
      case 'ARCHIVED':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Detalle del Local {property ? `N° ${property.localNumber}` : ''}
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        {property ? (
          <Stack spacing={2}>
            {/* Información del Local */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Información del Local
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Número de Local:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {property.localNumber}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Ubicación:
                  </Typography>
                  <Chip
                    label={getUbicacionLabel(property.ubicacion)}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Tipo:
                  </Typography>
                  <Chip
                    label={getPropertyTypeLabel(property.propertyType)}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Renta Mensual:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {formatCurrency(property.monthlyRent)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Estado:
                  </Typography>
                  <Chip
                    label={getStatusLabel(property.status)}
                    size="small"
                    color={getStatusColor(property.status) as any}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Disponibilidad:
                  </Typography>
                  <Chip
                    label={property.tenantId === null ? 'Disponible' : 'Ocupado'}
                    size="small"
                    color={property.tenantId === null ? 'success' : 'warning'}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Información del Inquilino */}
            {property.tenantId !== null && property.tenant && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Información del Inquilino
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Nombre:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {property.tenant.firstName} {property.tenant.lastName}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}

          </Stack>
        ) : (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No hay información del local disponible
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}


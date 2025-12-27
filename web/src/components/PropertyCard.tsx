import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Typography,
  Box,
} from '@mui/material';
import { Property } from '../../../shared/types/Property';

interface PropertyCardProps {
  property: Property;
  onViewDetails?: (property: Property) => void;
  onEdit?: (property: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onViewDetails, onEdit }) => {
  const getAvailabilityColor = (tenantId: number | null) => {
    return tenantId === null ? 'success' : 'warning';
  };

  const getAvailabilityLabel = (tenantId: number | null) => {
    return tenantId === null ? 'Disponible' : 'No Disponible';
  };


  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Local N° {property.localNumber}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {property.ubicacion === 'BOULEVARD' ? 'Boulevard' : property.ubicacion === 'SAN_MARTIN' ? 'San Martin' : property.ubicacion}
        </Typography>
        <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
          ${property.monthlyRent.toLocaleString()}/mes
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip label={property.propertyType === 'INSIDE' ? 'Adentro' : 'Afuera'} size="small" variant="outlined" />
          <Chip
            label={getAvailabilityLabel(property.tenantId)}
            size="small"
            color={getAvailabilityColor(property.tenantId) as any}
          />
        </Box>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          onClick={() => onViewDetails?.(property)}
        >
          Ver Detalles
        </Button>
        <Button
          size="small"
          color="secondary"
          onClick={() => onEdit?.(property)}
        >
          Editar
        </Button>
      </CardActions>
    </Card>
  );
};

export default PropertyCard;

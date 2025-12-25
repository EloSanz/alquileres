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

interface Property {
  id: number;
  name: string;
  localNumber: number;
  state: string;
  propertyType: string;
  monthlyRent: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  description?: string;
  zipCode?: string;
  isAvailable?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PropertyCardProps {
  property: Property;
  onViewDetails?: (property: Property) => void;
  onEdit?: (property: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onViewDetails, onEdit }) => {
  const getAvailabilityColor = (isAvailable?: boolean) => {
    return isAvailable ? 'success' : 'warning';
  };

  const getAvailabilityLabel = (isAvailable?: boolean) => {
    return isAvailable ? 'Disponible' : 'No Disponible';
  };


  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {property.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Local N° {property.localNumber}, {property.state}
          {property.zipCode && ` ${property.zipCode}`}
        </Typography>
        <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
          ${property.monthlyRent.toLocaleString()}/mes
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {property.bedrooms && <Chip label={`${property.bedrooms} hab`} size="small" />}
          {property.bathrooms && <Chip label={`${property.bathrooms} baños`} size="small" />}
          {property.areaSqm && <Chip label={`${property.areaSqm}m²`} size="small" />}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip label={property.propertyType === 'INSIDE' ? 'Adentro' : 'Afuera'} size="small" variant="outlined" />
          <Chip
            label={getAvailabilityLabel(property.isAvailable)}
            size="small"
            color={getAvailabilityColor(property.isAvailable) as any}
          />
        </Box>
        {property.description && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            {property.description}
          </Typography>
        )}
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

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
  title: string;
  description: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PropertyCardProps {
  property: Property;
  onViewDetails?: (property: Property) => void;
  onEdit?: (property: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onViewDetails, onEdit }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'success';
      case 'rented':
        return 'warning';
      case 'maintenance':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type.toUpperCase()) {
      case 'HOUSE':
        return 'Casa';
      case 'APARTMENT':
        return 'Apartamento';
      case 'CONDO':
        return 'Condominio';
      case 'TOWNHOUSE':
        return 'Townhouse';
      default:
        return type;
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {property.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {property.address}
        </Typography>
        <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
          ${property.price.toLocaleString()}/mes
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip label={`${property.bedrooms} hab`} size="small" />
          <Chip label={`${property.bathrooms} baños`} size="small" />
          <Chip label={`${property.area}m²`} size="small" />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip label={getTypeLabel(property.type)} size="small" variant="outlined" />
          <Chip
            label={property.status}
            size="small"
            color={getStatusColor(property.status) as any}
          />
        </Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {property.description}
        </Typography>
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

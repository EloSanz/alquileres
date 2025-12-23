import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import PropertyCard from '../components/PropertyCard';
import { propertyService, Property, CreatePropertyData } from '../services/propertyService';

const PropertyPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    propertyType: 'HOUSE',
    monthlyRent: '',
    bedrooms: '',
    bathrooms: '',
    areaSqm: '',
    description: '',
    zipCode: '',
    isAvailable: true,
  });

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await propertyService.getAllProperties();
      setProperties(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProperty = async () => {
    try {
      const propertyData: CreatePropertyData = {
        name: createForm.name,
        address: createForm.address,
        city: createForm.city,
        state: createForm.state,
        propertyType: createForm.propertyType,
        monthlyRent: parseFloat(createForm.monthlyRent),
        bedrooms: createForm.bedrooms ? parseInt(createForm.bedrooms) : undefined,
        bathrooms: createForm.bathrooms ? parseInt(createForm.bathrooms) : undefined,
        areaSqm: createForm.areaSqm ? parseFloat(createForm.areaSqm) : undefined,
        description: createForm.description || undefined,
        zipCode: createForm.zipCode || undefined,
        isAvailable: createForm.isAvailable,
      };

      await propertyService.createProperty(propertyData);

      setCreateDialogOpen(false);
      setCreateForm({
        name: '',
        address: '',
        city: '',
        state: '',
        propertyType: 'HOUSE',
        monthlyRent: '',
        bedrooms: '',
        bathrooms: '',
        areaSqm: '',
        description: '',
        zipCode: '',
        isAvailable: true,
      });
      fetchProperties(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to create property');
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleViewDetails = (property: Property) => {
    // TODO: Navigate to property details page
    console.log('View details for property:', property.id);
  };

  const handleEdit = (property: Property) => {
    // TODO: Open edit dialog or navigate to edit page
    console.log('Edit property:', property.id);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Propiedades
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {properties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property.id}>
              <PropertyCard
                property={property}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button for creating new property */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Create Property Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Crear Nueva Propiedad</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre de la Propiedad"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                value={createForm.address}
                onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ciudad"
                value={createForm.city}
                onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estado/Provincia"
                value={createForm.state}
                onChange={(e) => setCreateForm({ ...createForm, state: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código Postal"
                value={createForm.zipCode}
                onChange={(e) => setCreateForm({ ...createForm, zipCode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Tipo de Propiedad"
                value={createForm.propertyType}
                onChange={(e) => setCreateForm({ ...createForm, propertyType: e.target.value })}
                required
              >
                <MenuItem value="HOUSE">Casa</MenuItem>
                <MenuItem value="APARTMENT">Apartamento</MenuItem>
                <MenuItem value="CONDO">Condominio</MenuItem>
                <MenuItem value="TOWNHOUSE">Townhouse</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Renta Mensual"
                type="number"
                value={createForm.monthlyRent}
                onChange={(e) => setCreateForm({ ...createForm, monthlyRent: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Área (m²)"
                type="number"
                value={createForm.areaSqm}
                onChange={(e) => setCreateForm({ ...createForm, areaSqm: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Habitaciones"
                type="number"
                value={createForm.bedrooms}
                onChange={(e) => setCreateForm({ ...createForm, bedrooms: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Baños"
                type="number"
                value={createForm.bathrooms}
                onChange={(e) => setCreateForm({ ...createForm, bathrooms: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Disponible"
                value={createForm.isAvailable ? 'true' : 'false'}
                onChange={(e) => setCreateForm({ ...createForm, isAvailable: e.target.value === 'true' })}
              >
                <MenuItem value="true">Sí</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreateProperty} variant="contained">
            Crear Propiedad
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PropertyPage;

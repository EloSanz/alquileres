import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Grid,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Visibility as VisibilityIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { propertyService, Property, CreatePropertyData, UpdatePropertyData } from '../services/propertyService';
import NavigationTabs from '../components/NavigationTabs';

const PropertyPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    address: '',
    city: 'Miraflores',
    state: 'Lima',
    propertyType: 'APARTMENT',
    monthlyRent: '',
    bedrooms: '',
    bathrooms: '',
    areaSqm: '',
    description: '',
    zipCode: '',
    isAvailable: true,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editForm, setEditForm] = useState({
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(''); // Limpiar error anterior
      const data = await propertyService.getAllProperties();
      setProperties(data);
    } catch (err: any) {
      // Solo mostrar error si es un error real de red/API, no si es array vacío
      if (err.message && !err.message.includes('fetch')) {
        setError(err.message);
      }
      // Si es array vacío, no es error - simplemente no hay datos
      setProperties([]);
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
        city: 'Miraflores',
        state: 'Lima',
        propertyType: 'APARTMENT',
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
    setEditingProperty(property);
    setEditForm({
      name: property.name,
      address: property.address,
      city: property.city,
      state: property.state,
      propertyType: property.propertyType,
      monthlyRent: property.monthlyRent?.toString() || '',
      bedrooms: property.bedrooms?.toString() || '',
      bathrooms: property.bathrooms?.toString() || '',
      areaSqm: property.areaSqm?.toString() || '',
      description: property.description || '',
      zipCode: property.zipCode || '',
      isAvailable: property.isAvailable ?? true,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;

    try {
      await propertyService.deleteProperty(propertyToDelete.id);
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
      fetchProperties(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to delete property');
    }
  };

  const handleUpdateProperty = async () => {
    if (!editingProperty) return;

    try {
      const propertyData: UpdatePropertyData = {
        name: editForm.name,
        address: editForm.address,
        city: editForm.city,
        state: editForm.state,
        propertyType: editForm.propertyType,
        monthlyRent: parseFloat(editForm.monthlyRent),
        bedrooms: editForm.bedrooms ? parseInt(editForm.bedrooms) : undefined,
        bathrooms: editForm.bathrooms ? parseInt(editForm.bathrooms) : undefined,
        areaSqm: editForm.areaSqm ? parseFloat(editForm.areaSqm) : undefined,
        description: editForm.description || undefined,
        zipCode: editForm.zipCode || undefined,
        isAvailable: editForm.isAvailable,
      };

      await propertyService.updateProperty(editingProperty.id, propertyData);

      setEditDialogOpen(false);
      setEditingProperty(null);
      setEditForm({
        name: '',
        address: '',
        city: 'Miraflores',
        state: 'Lima',
        propertyType: 'APARTMENT',
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
      setError(err.message || 'Failed to update property');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Propiedades
        </Typography>
      </Box>

      {/* Navigation Menu - Siempre visible */}
      <NavigationTabs />

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
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Nombre</strong></TableCell>
                <TableCell><strong>Dirección</strong></TableCell>
                <TableCell><strong>Ciudad</strong></TableCell>
                <TableCell><strong>Tipo</strong></TableCell>
                <TableCell align="right"><strong>Renta Mensual</strong></TableCell>
                <TableCell align="center"><strong>Disponible</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id} hover>
                  <TableCell>{property.name}</TableCell>
                  <TableCell>{property.address}</TableCell>
                  <TableCell>{property.city}, {property.state}</TableCell>
                  <TableCell>
                    <Chip
                      label={property.propertyType === 'HOUSE' ? 'Casa' :
                             property.propertyType === 'APARTMENT' ? 'Apartamento' :
                             property.propertyType === 'CONDO' ? 'Condominio' :
                             property.propertyType === 'TOWNHOUSE' ? 'Townhouse' :
                             property.propertyType}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">S/ {property.monthlyRent?.toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={property.isAvailable ? 'Disponible' : 'No Disponible'}
                      color={property.isAvailable ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(property)}
                      title="Ver detalles"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(property)}
                      title="Editar"
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(property)}
                      title="Eliminar"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {properties.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay propiedades registradas
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
                placeholder="Ej: Av. Larco 123, Miraflores"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Distrito"
                value={createForm.city}
                onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                placeholder="Ej: Miraflores, San Isidro, Barranco"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Provincia"
                value={createForm.state}
                onChange={(e) => setCreateForm({ ...createForm, state: e.target.value })}
                defaultValue="Lima"
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
                label="Renta Mensual (S/)"
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

      {/* Edit Property Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Editar Propiedad</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre de la Propiedad"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ciudad"
                value={editForm.city}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estado/Provincia"
                value={editForm.state}
                onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código Postal"
                value={editForm.zipCode}
                onChange={(e) => setEditForm({ ...editForm, zipCode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Tipo de Propiedad"
                value={editForm.propertyType}
                onChange={(e) => setEditForm({ ...editForm, propertyType: e.target.value })}
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
                label="Renta Mensual (S/)"
                type="number"
                value={editForm.monthlyRent}
                onChange={(e) => setEditForm({ ...editForm, monthlyRent: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Área (m²)"
                type="number"
                value={editForm.areaSqm}
                onChange={(e) => setEditForm({ ...editForm, areaSqm: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Habitaciones"
                type="number"
                value={editForm.bedrooms}
                onChange={(e) => setEditForm({ ...editForm, bedrooms: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Baños"
                type="number"
                value={editForm.bathrooms}
                onChange={(e) => setEditForm({ ...editForm, bathrooms: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Disponible"
                value={editForm.isAvailable ? 'true' : 'false'}
                onChange={(e) => setEditForm({ ...editForm, isAvailable: e.target.value === 'true' })}
              >
                <MenuItem value="true">Sí</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleUpdateProperty} variant="contained">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar la propiedad{' '}
            <strong>{propertyToDelete?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PropertyPage;

import { useState, useEffect, useRef } from 'react';
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
  Autocomplete,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { usePropertyService } from '../services/propertyService';
import { Property, CreateProperty, UpdateProperty } from '../../../shared/types/Property';
import { useTenantService } from '../services/tenantService';
import { Tenant } from '../../../shared/types/Tenant';
import NavigationTabs from '../components/NavigationTabs';
import SearchBar from '../components/SearchBar';
import FilterBar, { type FilterConfig } from '../components/FilterBar';

const PropertyPage = () => {
  const propertyService = usePropertyService()
  const tenantService = useTenantService()
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string | string[]>>({
    isAvailable: '',
    propertyType: ''
  });

  const propertyFilters: FilterConfig[] = [
    {
      key: 'isAvailable',
      label: 'Disponibilidad',
      options: [
        { value: 'true', label: 'Disponible' },
        { value: 'false', label: 'Ocupada' }
      ]
    },
    {
      key: 'propertyType',
      label: 'Ubicación',
      options: [
        { value: 'INSIDE', label: 'Adentro' },
        { value: 'OUTSIDE', label: 'Afuera' }
      ]
    }
  ];
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    localNumber: '',
    ubicacion: 'BOULEVARD',
    propertyType: 'INSIDE',
    monthlyRent: '',
    isAvailable: true,
    tenantId: null as number | null,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editForm, setEditForm] = useState({
    localNumber: '',
    ubicacion: 'BOULEVARD',
    propertyType: 'INSIDE',
    monthlyRent: '',
    isAvailable: true,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [localNumberError, setLocalNumberError] = useState<string>('');

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(''); // Limpiar error anterior
      const data = await propertyService.getAllProperties();
      setProperties(data);
      const filtered = filterProperties(searchQuery, filterValues, data);
      setFilteredProperties(filtered);
    } catch (err: any) {
      // Solo mostrar error si es un error real de red/API, no si es array vacío
      if (err.message && !err.message.includes('fetch')) {
        setError(err.message);
      }
      // Si es array vacío, no es error - simplemente no hay datos
      setProperties([]);
      setFilteredProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = (query: string, filters: Record<string, string | string[]>, propertiesList: Property[]) => {
    return propertiesList.filter(property => {
      // Filtro de búsqueda por texto
      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        const matchesQuery =
          property.localNumber.toString().includes(lowerQuery) ||
          property.ubicacion.toLowerCase().includes(lowerQuery) ||
          (property.propertyType === 'INSIDE' ? 'adentro' : 'afuera').includes(lowerQuery) ||
          property.tenant?.firstName.toLowerCase().includes(lowerQuery) ||
          property.tenant?.lastName.toLowerCase().includes(lowerQuery);

        if (!matchesQuery) return false;
      }

      // Filtro por disponibilidad
      if (filters.isAvailable && property.isAvailable?.toString() !== filters.isAvailable) {
        return false;
      }

      // Filtro por tipo de propiedad
      if (filters.propertyType && property.propertyType !== filters.propertyType) {
        return false;
      }

      return true;
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    const filtered = filterProperties(query, filterValues, properties);
    setFilteredProperties(filtered);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    const filtered = filterProperties('', filterValues, properties);
    setFilteredProperties(filtered);
  };

  const handleFilterChange = (key: string, value: string | string[]) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    const filtered = filterProperties(searchQuery, newFilters, properties);
    setFilteredProperties(filtered);
  };

  const handleClearFilters = () => {
    const newFilters = { isAvailable: '', propertyType: '' };
    setFilterValues(newFilters);
    const filtered = filterProperties(searchQuery, newFilters, properties);
    setFilteredProperties(filtered);
  };

  const handleCreateProperty = async () => {
    try {
      // Validar que se haya seleccionado un inquilino
      if (!createForm.tenantId) {
        setError('Por favor seleccione un inquilino');
        return;
      }

      // Validar que el número de local no exista (ya validado en tiempo real, pero verificamos por seguridad)
      if (localNumberError) {
        setError(localNumberError);
        return;
      }

      const localNumber = parseInt(createForm.localNumber);
      const propertyData = new CreateProperty(
        localNumber,
        createForm.ubicacion as 'BOULEVARD' | 'SAN_MARTIN',
        createForm.propertyType,
        parseFloat(createForm.monthlyRent),
        createForm.tenantId,
        createForm.isAvailable
      );

      await propertyService.createProperty(propertyData);

      setCreateDialogOpen(false);
      setCreateForm({
        localNumber: '',
        ubicacion: 'BOULEVARD',
        propertyType: 'INSIDE',
        monthlyRent: '',
        isAvailable: true,
        tenantId: null,
      });
      setError('');
      setLocalNumberError('');
      fetchProperties(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to create property');
    }
  };

  const hasFetchedRef = useRef(false);
  
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchProperties();
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const data = await tenantService.getAllTenants();
      setTenants(data);
    } catch (err: any) {
      console.error('Error fetching tenants:', err);
    }
  };

  // Aplicar filtros cuando cambien los criterios
  useEffect(() => {
    const filtered = filterProperties(searchQuery, filterValues, properties);
    setFilteredProperties(filtered);
  }, [searchQuery, filterValues, properties]);

  // Validar número de local en tiempo real
  useEffect(() => {
    if (!createDialogOpen) {
      setLocalNumberError('');
      return;
    }

    const localNumber = createForm.localNumber.trim();
    if (!localNumber) {
      setLocalNumberError('');
      return;
    }

    const numValue = parseInt(localNumber);
    if (isNaN(numValue) || numValue <= 0) {
      setLocalNumberError('');
      return;
    }

    const existingProperty = properties.find(p => p.localNumber === numValue);
    if (existingProperty) {
      setLocalNumberError(`Ya existe un local con el número ${numValue}`);
    } else {
      setLocalNumberError('');
    }
  }, [createForm.localNumber, properties, createDialogOpen]);

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setEditForm({
      localNumber: property.localNumber?.toString() || '',
      ubicacion: property.ubicacion || 'BOULEVARD',
      propertyType: property.propertyType,
      monthlyRent: property.monthlyRent?.toString() || '',
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
      const propertyData = new UpdateProperty(
        parseInt(editForm.localNumber),
        editForm.ubicacion as 'BOULEVARD' | 'SAN_MARTIN' | undefined,
        editForm.propertyType,
        parseFloat(editForm.monthlyRent),
        editForm.isAvailable
      );

      await propertyService.updateProperty(editingProperty.id, propertyData);

      setEditDialogOpen(false);
      setEditingProperty(null);
      setEditForm({
        localNumber: '',
        ubicacion: 'BOULEVARD',
        propertyType: 'INSIDE',
        monthlyRent: '',
        isAvailable: true,
      });
      fetchProperties(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to update property');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Locales
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, maxWidth: 400 }}>
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onClearSearch={handleClearSearch}
              placeholder="Buscar por número de local, ubicación..."
              label="Buscar propiedades"
            />
          </Box>
          <FilterBar
            filters={propertyFilters}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </Box>
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
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>N° Local</strong></TableCell>
                <TableCell><strong>Ubicación</strong></TableCell>
                <TableCell><strong>Tipo</strong></TableCell>
                <TableCell align="right"><strong>Renta Mensual</strong></TableCell>
                <TableCell align="center"><strong>Disponible</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProperties.map((property) => (
                <TableRow
                  key={property.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.12)',
                    },
                  }}
                >
                  <TableCell>{property.id}</TableCell>
                  <TableCell>{property.localNumber}</TableCell>
                  <TableCell>
                    <Chip
                      label={property.ubicacion === 'BOULEVARD' ? 'Boulevard' :
                             property.ubicacion === 'SAN_MARTIN' ? 'San Martin' :
                             property.ubicacion}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={property.propertyType === 'INSIDE' ? 'Adentro' :
                             property.propertyType === 'OUTSIDE' ? 'Afuera' :
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
                      No hay locales registrados
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
        variant="extended"
        size="large"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          px: 3,
          py: 1.5
        }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon sx={{ mr: 1 }} />
        Agregar Local
      </Fab>

      {/* Create Property Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => {
          setCreateDialogOpen(false);
          setLocalNumberError('');
        }} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Agregar Local</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Número de Local"
                type="number"
                value={createForm.localNumber}
                onChange={(e) => setCreateForm({ ...createForm, localNumber: e.target.value })}
                placeholder="Ej: 123"
                required
                error={!!localNumberError}
                helperText={localNumberError}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                options={tenants}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName}${option.documentId ? ` - DNI: ${option.documentId}` : ''}`}
                value={tenants.find(t => t.id === createForm.tenantId) || null}
                onChange={(_, newValue) => {
                  setCreateForm({ ...createForm, tenantId: newValue?.id || null });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Inquilino"
                    placeholder="Buscar por nombre, apellido o DNI"
                    required
                  />
                )}
                filterOptions={(options, { inputValue }) => {
                  const searchLower = inputValue.toLowerCase();
                  return options.filter(option =>
                    option.firstName.toLowerCase().includes(searchLower) ||
                    option.lastName.toLowerCase().includes(searchLower) ||
                    option.documentId?.toLowerCase().includes(searchLower)
                  );
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Ubicación"
                value={createForm.ubicacion}
                onChange={(e) => setCreateForm({ ...createForm, ubicacion: e.target.value })}
                required
              >
                <MenuItem value="BOULEVARD">Boulevard</MenuItem>
                <MenuItem value="SAN_MARTIN">San Martin</MenuItem>
              </TextField>
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
                <MenuItem value="INSIDE">Adentro</MenuItem>
                <MenuItem value="OUTSIDE">Afuera</MenuItem>
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setCreateDialogOpen(false);
              setLocalNumberError('');
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateProperty} 
            variant="contained"
            disabled={!!localNumberError}
          >
            Crear Local
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Property Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Editar Local</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Número de Local"
                type="number"
                value={editForm.localNumber}
                onChange={(e) => setEditForm({ ...editForm, localNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Ubicación"
                value={editForm.ubicacion}
                onChange={(e) => setEditForm({ ...editForm, ubicacion: e.target.value })}
                required
              >
                <MenuItem value="BOULEVARD">Boulevard</MenuItem>
                <MenuItem value="SAN_MARTIN">San Martin</MenuItem>
              </TextField>
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
                <MenuItem value="INSIDE">Adentro</MenuItem>
                <MenuItem value="OUTSIDE">Afuera</MenuItem>
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
            ¿Estás seguro de que quieres eliminar el local{' '}
            <strong>N° {propertyToDelete?.localNumber}</strong>?
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

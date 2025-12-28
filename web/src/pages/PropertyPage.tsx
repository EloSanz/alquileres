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
  Autocomplete,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { usePropertyService } from '../services/propertyService';
import { Property, CreateProperty, UpdateProperty } from '../../../shared/types/Property';
import { useDataGateway } from '../gateways/useDataGateway';
import NavigationTabs from '../components/NavigationTabs';
import SearchBar from '../components/SearchBar';
import PropertyDetailsModal from '../components/PropertyDetailsModal';

const PropertyPage = () => {
  const propertyService = usePropertyService()
  const dataGateway = useDataGateway()
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    localNumber: '',
    ubicacion: 'BOULEVAR',
    monthlyRent: '',
    tenantId: null as number | null,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editForm, setEditForm] = useState({
    localNumber: '',
    ubicacion: 'BOULEVAR',
    monthlyRent: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [localNumberError, setLocalNumberError] = useState<string>('');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const fetchProperties = () => {
    try {
      setError('');
      // Usar DataGateway para obtener datos desde cache
      const data = dataGateway.getProperties();
      setProperties(data);
      const filtered = filterProperties(searchQuery, data);
      setFilteredProperties(filtered);
    } catch (err: any) {
      setError(err.message || 'Error al cargar propiedades');
      setProperties([]);
      setFilteredProperties([]);
    }
  };

  const filterProperties = (query: string, propertiesList: Property[]) => {
    return propertiesList.filter(property => {
      // Filtro de búsqueda por texto
      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        const matchesQuery =
          property.localNumber.toString().includes(lowerQuery) ||
          property.ubicacion.toLowerCase().includes(lowerQuery) ||
          property.tenant?.firstName.toLowerCase().includes(lowerQuery) ||
          property.tenant?.lastName.toLowerCase().includes(lowerQuery);

        if (!matchesQuery) return false;
      }

      return true;
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    const filtered = filterProperties(query, properties);
    setFilteredProperties(filtered);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    const filtered = filterProperties('', properties);
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
        createForm.ubicacion as 'BOULEVAR' | 'SAN_MARTIN' | 'PATIO',
        parseFloat(createForm.monthlyRent),
        createForm.tenantId
      );

      await propertyService.createProperty(propertyData);

      setCreateDialogOpen(false);
      setCreateForm({
        localNumber: '',
        ubicacion: 'BOULEVAR',
        monthlyRent: '',
        tenantId: null,
      });
      setError('');
      setLocalNumberError('');
      // Invalidar cache y recargar desde el servicio
      dataGateway.invalidate();
      await dataGateway.loadAll();
      fetchProperties();
    } catch (err: any) {
      setError(err.message || 'Failed to create property');
    }
  };

  useEffect(() => {
    // Esperar a que el DataGateway cargue los datos
    const loadData = async () => {
      if (!dataGateway.isLoaded() && !dataGateway.isLoading()) {
        setLoading(true);
        try {
          await dataGateway.loadAll();
        } catch (err: any) {
          setError(err.message || 'Error al cargar datos');
        } finally {
          setLoading(false);
        }
      }
      
      // Una vez cargado, obtener datos del gateway
      if (dataGateway.isLoaded()) {
        fetchProperties();
      }
    };
    
    loadData();
  }, [dataGateway]);
  
  // Actualizar cuando el gateway termine de cargar
  useEffect(() => {
    if (dataGateway.isLoaded()) {
      fetchProperties();
      setLoading(false);
    }
  }, [dataGateway.isLoaded()]);

  // Aplicar filtros cuando cambien los criterios
  useEffect(() => {
    const filtered = filterProperties(searchQuery, properties);
    setFilteredProperties(filtered);
  }, [searchQuery, properties]);

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

  const handleRowClick = (property: Property) => {
    setSelectedProperty(property);
    setDetailsModalOpen(true);
  };

  const handleEdit = (property: Property, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setEditingProperty(property);
    // Normalizar ubicacion por compatibilidad antigua ('BOULEVARD' -> 'BOULEVAR')
    const normalizedUbicacion =
      ((property.ubicacion as unknown as string) === 'BOULEVARD' ? 'BOULEVAR' : property.ubicacion) || 'BOULEVAR';
    setEditForm({
      localNumber: property.localNumber?.toString() || '',
      ubicacion: normalizedUbicacion as 'BOULEVAR' | 'SAN_MARTIN' | 'PATIO',
      monthlyRent: property.monthlyRent?.toString() || '',
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (property: Property, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;

    try {
      await propertyService.deleteProperty(propertyToDelete.id);
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
      // Invalidar cache y recargar desde el servicio
      dataGateway.invalidate();
      await dataGateway.loadAll();
      fetchProperties();
    } catch (err: any) {
      setError(err.message || 'Failed to delete property');
    }
  };

  const handleUpdateProperty = async () => {
    if (!editingProperty) return;

    try {
      const propertyData = new UpdateProperty(
        parseInt(editForm.localNumber),
        editForm.ubicacion as 'BOULEVAR' | 'SAN_MARTIN' | 'PATIO' | undefined,
        parseFloat(editForm.monthlyRent)
      );

      await propertyService.updateProperty(editingProperty.id, propertyData);
      // Invalidar cache y recargar desde el servicio
      dataGateway.invalidate();
      await dataGateway.loadAll();
      fetchProperties();

      setEditDialogOpen(false);
      setEditingProperty(null);
      setEditForm({
        localNumber: '',
        ubicacion: 'BOULEVAR',
        monthlyRent: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update property');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: { xs: 'block', sm: 'flex' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: 2 
        }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Locales
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 250 }, maxWidth: { xs: '100%', sm: 400 } }}>
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onClearSearch={handleClearSearch}
              placeholder="Buscar por número de local, ubicación..."
              label="Buscar propiedades"
            />
          </Box>
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
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>N° Local</strong></TableCell>
                <TableCell><strong>Ubicación</strong></TableCell>
                  <TableCell><strong>Inquilino</strong></TableCell>
                <TableCell align="right"><strong>Renta Mensual</strong></TableCell>
                  <TableCell align="center"><strong>Estado</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProperties.map((property) => (
                <TableRow
                  key={property.id}
                  hover
                  onClick={() => handleRowClick(property)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.12)',
                    },
                  }}
                >
                  <TableCell>{property.localNumber}</TableCell>
                  <TableCell>
                    <Chip
                      label={property.ubicacion === 'BOULEVAR' ? 'Boulevar' :
                             property.ubicacion === 'SAN_MARTIN' ? 'San Martín' :
                             property.ubicacion === 'PATIO' ? 'Patio' :
                             property.ubicacion}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    {property.tenant
                      ? `${property.tenant.firstName} ${property.tenant.lastName}`
                      : <Typography variant="body2" color="text.secondary">Disponible</Typography>}
                  </TableCell>
                  <TableCell align="right">S/ {property.monthlyRent?.toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={
                        property.status === 'ACTIVE' ? 'Activo' :
                        property.status === 'INACTIVE' ? 'Inactivo' :
                        property.status === 'ARCHIVED' ? 'Archivado' :
                        property.status
                      }
                      size="small"
                      color={
                        property.status === 'ACTIVE' ? 'success' :
                        property.status === 'INACTIVE' ? 'warning' :
                        property.status === 'ARCHIVED' ? 'default' : 'default'
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleEdit(property, e)}
                      title="Editar"
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleDelete(property, e)}
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
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
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
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
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
                options={dataGateway.getTenants()}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName}${option.documentId ? ` - DNI: ${option.documentId}` : ''}`}
                value={dataGateway.getTenants().find(t => t.id === createForm.tenantId) || null}
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
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (value) => {
                    const v = (value as string) || '';
                    if (!v) return 'Seleccionar ubicación';
                    return v === 'BOULEVAR'
                      ? 'Boulevar'
                      : v === 'SAN_MARTIN'
                      ? 'San Martín'
                      : v === 'PATIO'
                      ? 'Patio'
                      : v;
                  },
                }}
              >
                <MenuItem value="BOULEVAR">Boulevar</MenuItem>
                <MenuItem value="SAN_MARTIN">San Martín</MenuItem>
                <MenuItem value="PATIO">Patio</MenuItem>
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
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
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
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (value) => {
                    const v = (value as string) || '';
                    if (!v) return 'Seleccionar ubicación';
                    return v === 'BOULEVAR'
                      ? 'Boulevar'
                      : v === 'SAN_MARTIN'
                      ? 'San Martín'
                      : v === 'PATIO'
                      ? 'Patio'
                      : v;
                  },
                }}
              >
                <MenuItem value="BOULEVAR">Boulevar</MenuItem>
                <MenuItem value="SAN_MARTIN">San Martín</MenuItem>
                <MenuItem value="PATIO">Patio</MenuItem>
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
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
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

      {/* Property Details Modal */}
      <PropertyDetailsModal
        open={detailsModalOpen}
        property={selectedProperty}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedProperty(null);
        }}
      />
    </Container>
  );
};

export default PropertyPage;

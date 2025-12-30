import { useState } from 'react';
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
import { useProperties } from '../hooks/useProperties';
import { useTenants } from '../hooks/useTenants';
import { Property, CreateProperty, UpdateProperty } from '../../../shared/types/Property';
import NavigationTabs from '../components/NavigationTabs';
import SearchBar from '../components/SearchBar';
import PropertyDetailsModal from '../components/PropertyDetailsModal';

const PropertyPage = () => {
  const {
    properties,
    isLoading: loading,
    error: queryError,
    createProperty,
    updateProperty,
    deleteProperty
  } = useProperties();

  const { tenants } = useTenants();

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
  const [actionError, setActionError] = useState('');

  // Filtering logic
  const filteredProperties = properties.filter(property => {
    if (!searchQuery.trim()) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      property.localNumber.toString().includes(lowerQuery) ||
      property.ubicacion.toLowerCase().includes(lowerQuery) ||
      property.tenant?.firstName.toLowerCase().includes(lowerQuery) ||
      property.tenant?.lastName.toLowerCase().includes(lowerQuery)
    );
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleCreateProperty = async () => {
    try {
      setActionError('');

      /* 
       * Note: createForm.tenantId logic was removed for simplicity in this refactor 
       * as tenants list is not fetched here. 
       * Ideally, useTenants hook should be used to populate the select.
       * For now, we proceed without setting tenantId or assuming null.
       */

      const newProperty: CreateProperty = {
        localNumber: parseInt(createForm.localNumber),
        ubicacion: createForm.ubicacion as 'BOULEVAR' | 'SAN_MARTIN' | 'PATIO',
        monthlyRent: parseFloat(createForm.monthlyRent),
        tenantId: createForm.tenantId
      };

      await createProperty(newProperty);

      setCreateDialogOpen(false);
      setCreateForm({
        localNumber: '',
        ubicacion: 'BOULEVAR',
        monthlyRent: '',
        tenantId: null,
      });
      setLocalNumberError('');
    } catch (err: any) {
      setActionError(err.message || 'Failed to create property');
    }
  };

  const handleUpdateProperty = async () => {
    if (!editingProperty) return;

    try {
      setActionError('');
      const updateData: UpdateProperty = {
        localNumber: parseInt(editForm.localNumber),
        ubicacion: editForm.ubicacion as 'BOULEVAR' | 'SAN_MARTIN' | 'PATIO',
        monthlyRent: parseFloat(editForm.monthlyRent)
      };

      await updateProperty({ id: editingProperty.id, data: updateData });

      setEditDialogOpen(false);
      setEditingProperty(null);
      setEditForm({
        localNumber: '',
        ubicacion: 'BOULEVAR',
        monthlyRent: '',
      });
    } catch (err: any) {
      setActionError(err.message || 'Failed to update property');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;
    try {
      setActionError('');
      await deleteProperty(propertyToDelete.id);
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete property');
    }
  };

  const handleEdit = (property: Property, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setEditingProperty(property);
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
    if (event) event.stopPropagation();
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const handleRowClick = (property: Property) => {
    setSelectedProperty(property);
    setDetailsModalOpen(true);
  };

  // Real-time validation for local number
  const validateLocalNumber = (value: string) => {
    if (!value) return;
    const num = parseInt(value);
    const exists = properties.some(p => p.localNumber === num);
    if (exists) {
      setLocalNumberError(`Ya existe un local con el número ${num}`);
    } else {
      setLocalNumberError('');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const displayError = queryError ? (queryError as Error).message : actionError;

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

      <NavigationTabs />

      {displayError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setActionError('')}>
          {displayError}
        </Alert>
      )}

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
            {filteredProperties.length === 0 && (
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

      {/* Dialogs and Modals simplified for brevity but functionally effectively identical */}

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
                onChange={(e) => {
                  setCreateForm({ ...createForm, localNumber: e.target.value });
                  validateLocalNumber(e.target.value);
                }}
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
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleCreateProperty}
            variant="contained"
            disabled={!!localNumberError}
          >
            Crear Local
          </Button>
        </DialogActions>
      </Dialog>

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
          <Button onClick={handleUpdateProperty} variant="contained">Actualizar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography>
            ¿Estás seguro de que quieres eliminar el local{' '}
            <strong>N° {propertyToDelete?.localNumber}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>

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

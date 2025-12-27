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
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import NavigationTabs from '../components/NavigationTabs';
import SearchBar from '../components/SearchBar';
import FilterBar, { type FilterConfig } from '../components/FilterBar';
import TenantDeletionModal from '../components/TenantDeletionModal';
import { useTenantService } from '../services/tenantService';
import { Tenant, CreateTenant, UpdateTenant } from '../../../shared/types/Tenant';

const TenantPage = () => {
  const tenantService = useTenantService()
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string | string[]>>({
    sortBy: 'firstName'
  });

  const tenantFilters: FilterConfig[] = [
    {
      key: 'sortBy',
      label: 'Ordenar por',
      options: [
        { value: 'firstName', label: 'Nombre (A-Z)' },
        { value: 'lastName', label: 'Apellido (A-Z)' },
        { value: 'firstName_desc', label: 'Nombre (Z-A)' },
        { value: 'lastName_desc', label: 'Apellido (Z-A)' },
        { value: 'localNumber', label: 'N° Local (menor a mayor)' },
        { value: 'localNumber_desc', label: 'N° Local (mayor a menor)' }
      ]
    }
  ];
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{
    firstName: string;
    lastName: string;
    phone: string;
    documentId: string;
    numeroLocal: string;
    rubro: string;
    fechaInicioContrato: string;
  }>({
    firstName: '',
    lastName: '',
    phone: '',
    documentId: '',
    numeroLocal: '',
    rubro: '',
    fechaInicioContrato: '',
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editForm, setEditForm] = useState<{
    firstName: string;
    lastName: string;
    phone: string;
    documentId: string;
    numeroLocal: string;
    rubro: string;
    fechaInicioContrato: string;
  }>({
    firstName: '',
    lastName: '',
    phone: '',
    documentId: '',
    numeroLocal: '',
    rubro: '',
    fechaInicioContrato: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

  // Modal para mostrar propiedades y pagos asociados
  const [tenantDeletionModalOpen, setTenantDeletionModalOpen] = useState(false);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(''); // Limpiar error anterior
      const data = await tenantService.getAllTenants();
      setTenants(data);
      const filtered = filterAndSortTenants(searchQuery, filterValues, data);
      setFilteredTenants(filtered);
    } catch (err: any) {
      // Solo mostrar error si es un error real de red/API, no si es array vacío
      if (err.message && !err.message.includes('fetch')) {
        setError(err.message);
      }
      // Si es array vacío, no es error - simplemente no hay datos
      setTenants([]);
      setFilteredTenants([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTenants = (query: string, filters: Record<string, string | string[]>, tenantsList: Tenant[]) => {
    let filtered = tenantsList;

    // Aplicar filtro de búsqueda
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(tenant =>
        tenant.firstName.toLowerCase().includes(lowerQuery) ||
        tenant.lastName.toLowerCase().includes(lowerQuery) ||
        tenant.documentId.toLowerCase().includes(lowerQuery) ||
        tenant.phone?.toLowerCase().includes(lowerQuery) ||
        tenant.numeroLocal?.toLowerCase().includes(lowerQuery) ||
        tenant.rubro?.toLowerCase().includes(lowerQuery)
      );
    }

    // Aplicar ordenamiento
    const sortBy = filters.sortBy as string;
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'localNumber':
          // Ordenar por el número de local más bajo
          const aMinLocal = a.localNumbers && a.localNumbers.length > 0 ? Math.min(...a.localNumbers) : 999999;
          const bMinLocal = b.localNumbers && b.localNumbers.length > 0 ? Math.min(...b.localNumbers) : 999999;
          return aMinLocal - bMinLocal;

        case 'localNumber_desc':
          // Ordenar por el número de local más alto (descendente)
          const aMaxLocal = a.localNumbers && a.localNumbers.length > 0 ? Math.max(...a.localNumbers) : 0;
          const bMaxLocal = b.localNumbers && b.localNumbers.length > 0 ? Math.max(...b.localNumbers) : 0;
          return bMaxLocal - aMaxLocal;

        case 'firstName':
          return a.firstName.localeCompare(b.firstName);

        case 'lastName':
          return a.lastName.localeCompare(b.lastName);

        case 'firstName_desc':
          return b.firstName.localeCompare(a.firstName);

        case 'lastName_desc':
          return b.lastName.localeCompare(a.lastName);

        default:
          return a.firstName.localeCompare(b.firstName);
      }
    });

    return filtered;
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    const filtered = filterAndSortTenants(query, filterValues, tenants);
    setFilteredTenants(filtered);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    const filtered = filterAndSortTenants('', filterValues, tenants);
    setFilteredTenants(filtered);
  };

  const handleFilterChange = (key: string, value: string | string[]) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    const filtered = filterAndSortTenants(searchQuery, newFilters, tenants);
    setFilteredTenants(filtered);
  };

  const handleClearFilters = () => {
    const newFilters = { sortBy: 'firstName' };
    setFilterValues(newFilters);
    const filtered = filterAndSortTenants(searchQuery, newFilters, tenants);
    setFilteredTenants(filtered);
  };

  const handleCreateTenant = async () => {
    try {
      // Convert empty strings to undefined for fechaInicioContrato
      const fechaInicioContrato = createForm.fechaInicioContrato?.trim() || undefined;
      
      const tenantData = new CreateTenant(
        createForm.firstName,
        createForm.lastName,
        createForm.documentId,
        createForm.phone || undefined,
        createForm.numeroLocal || undefined,
        createForm.rubro || undefined,
        fechaInicioContrato
      );

      await tenantService.createTenant(tenantData);

      setCreateDialogOpen(false);
      setCreateForm({
        firstName: '',
        lastName: '',
        phone: '',
        documentId: '',
        numeroLocal: '',
        rubro: '',
        fechaInicioContrato: '',
      });
      fetchTenants(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to create tenant');
    }
  };

  const hasFetchedRef = useRef(false);
  
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchTenants();
  }, []);

  // Aplicar filtros y ordenamiento cuando cambien los criterios
  useEffect(() => {
    const filtered = filterAndSortTenants(searchQuery, filterValues, tenants);
    setFilteredTenants(filtered);
  }, [searchQuery, filterValues, tenants]);

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setEditForm({
      firstName: tenant.firstName,
      lastName: tenant.lastName,
      phone: tenant.phone || '',
      documentId: tenant.documentId,
      numeroLocal: tenant.numeroLocal?.toString() || '',
      rubro: tenant.rubro || '',
      fechaInicioContrato: formatDateForInput(tenant.fechaInicioContrato || ''),
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (tenant: Tenant) => {
    setTenantToDelete(tenant);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tenantToDelete) return;

    try {
      await tenantService.deleteTenant(tenantToDelete.id);
      setDeleteDialogOpen(false);
      setTenantToDelete(null);
      fetchTenants(); // Refresh the list
    } catch (err: any) {
      setError(err.message || err.response?.data?.message || 'Failed to delete tenant');
    }
  };


  const handleUpdateTenant = async () => {
    if (!editingTenant) {
      console.error('No tenant selected for editing');
      return;
    }

    try {
      setError(''); // Clear previous errors
      console.log('Updating tenant:', editingTenant.id, editForm);
      
      // Convert empty strings to undefined for fechaInicioContrato
      const fechaInicioContrato = editForm.fechaInicioContrato?.trim() || undefined;
      
      const tenantData = new UpdateTenant(
        editForm.firstName,
        editForm.lastName,
        editForm.phone || undefined,
        editForm.documentId || undefined,
        editForm.numeroLocal || undefined,
        editForm.rubro || undefined,
        fechaInicioContrato
      );

      console.log('Tenant data to update:', tenantData.toJSON());
      
      const updatedTenant = await tenantService.updateTenant(editingTenant.id, tenantData);
      
      console.log('Tenant updated successfully:', updatedTenant);

      // Actualizar estado local manteniendo el orden
      setTenants(prev => prev.map(t => t.id === updatedTenant.id ? updatedTenant : t));
      // El useEffect se encargará de re-filtrar y re-ordenar filteredTenants

      setEditDialogOpen(false);
      setEditingTenant(null);
      setEditForm({
        firstName: '',
        lastName: '',
        phone: '',
        documentId: '',
        numeroLocal: '',
        rubro: '',
        fechaInicioContrato: '',
      });
    } catch (err: any) {
      console.error('Error updating tenant:', err);
      setError(err.message || 'Failed to update tenant');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
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
            Inquilinos
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 250 }, maxWidth: { xs: '100%', sm: 400 } }}>
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onClearSearch={handleClearSearch}
              placeholder="Buscar por nombre, apellido, email..."
              label="Buscar inquilinos"
            />
          </Box>
          <FilterBar
            filters={tenantFilters}
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
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Nombre</strong></TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><strong>Teléfono</strong></TableCell>
                <TableCell><strong>DNI</strong></TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><strong>Locales</strong></TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><strong>Rubro</strong></TableCell>
                <TableCell><strong>Estado Pago</strong></TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><strong>Fecha Inicio</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow
                  key={tenant.id}
                  hover
                  onClick={() => handleEdit(tenant)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.12)',
                    },
                  }}
                >
                  <TableCell>
                    {tenant.firstName} {tenant.lastName}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{tenant.phone || '-'}</TableCell>
                  <TableCell>{tenant.documentId}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {tenant.localNumbers && tenant.localNumbers.length > 0
                      ? tenant.localNumbers.join(', ')
                      : tenant.numeroLocal ?? '-'
                    }
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{tenant.rubro || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={tenant.estadoPago === 'AL_DIA' ? 'Al día' : 'Con deuda'}
                      color={tenant.estadoPago === 'AL_DIA' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{tenant.fechaInicioContrato ? formatDate(tenant.fechaInicioContrato) : '-'}</TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(tenant)}
                      title="Editar"
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(tenant)}
                      title="Eliminar"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {tenants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay inquilinos registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Floating Action Button for creating new tenant */}
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
        Agregar Inquilino
      </Fab>

      {/* Create Tenant Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Agregar Inquilino</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre"
              value={createForm.firstName}
              onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Apellido"
              value={createForm.lastName}
              onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Teléfono"
              value={createForm.phone}
              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="DNI/Documento"
              value={createForm.documentId}
              onChange={(e) => setCreateForm({ ...createForm, documentId: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Número de Local (opcional)"
              value={createForm.numeroLocal}
              onChange={(e) => setCreateForm({ ...createForm, numeroLocal: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Rubro - Pedicure o Tipeo</InputLabel>
              <Select
                value={createForm.rubro}
                label="Rubro - Pedicure o Tipeo"
                onChange={(e) => setCreateForm({ ...createForm, rubro: e.target.value })}
              >
                <MenuItem value="TIPEO">Tipeo</MenuItem>
                <MenuItem value="PEDICURE">Pedicure</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Fecha de Inicio del Contrato"
              type="date"
              value={createForm.fechaInicioContrato}
              onChange={(e) => setCreateForm({ ...createForm, fechaInicioContrato: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreateTenant} variant="contained">
            Crear Inquilino
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Tenant Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Editar Inquilino</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box 
            component="form" 
            sx={{ mt: 2 }}
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateTenant();
            }}
          >
            <TextField
              fullWidth
              label="Nombre"
              value={editForm.firstName}
              onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Apellido"
              value={editForm.lastName}
              onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Teléfono"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="DNI/Documento"
              value={editForm.documentId}
              onChange={(e) => setEditForm({ ...editForm, documentId: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Número de Local"
              value={editForm.numeroLocal}
              onChange={(e) => setEditForm({ ...editForm, numeroLocal: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Rubro</InputLabel>
              <Select
                value={editForm.rubro}
                label="Rubro"
                onChange={(e) => setEditForm({ ...editForm, rubro: e.target.value })}
              >
                <MenuItem value="TIPEO">Tipeo</MenuItem>
                <MenuItem value="PEDICURE">Pedicure</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Fecha de Inicio del Contrato"
              type="date"
              value={editForm.fechaInicioContrato}
              onChange={(e) => setEditForm({ ...editForm, fechaInicioContrato: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} type="button">Cancelar</Button>
          <Button onClick={handleUpdateTenant} variant="contained" type="submit">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography>
            ¿Estás seguro de que quieres eliminar al inquilino{' '}
            <strong>
              {tenantToDelete?.firstName} {tenantToDelete?.lastName}
            </strong>
            ?
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

      {/* Tenant Deletion Modal */}
      <TenantDeletionModal
        open={tenantDeletionModalOpen}
        tenant={tenantToDelete}
        onConfirmDelete={async () => {
          await tenantService.deleteTenant(tenantToDelete!.id);
          setTenantDeletionModalOpen(false);
          setTenantToDelete(null);
          fetchTenants();
        }}
        onClose={() => setTenantDeletionModalOpen(false)}
      />
    </Container>
  );
};

export default TenantPage;

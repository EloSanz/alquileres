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
import RoleGuard from '../components/RoleGuard';
import OpenPaymentsForTenantButton from '../components/OpenPaymentsForTenantButton';
import NavigationTabs from '../components/NavigationTabs';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import type { FilterConfig } from '../components/FilterBar';
import { useTenants } from '../hooks/useTenants';
import { useProperties } from '../hooks/useProperties';
import { Tenant, CreateTenant, UpdateTenant } from '../../../shared/types/Tenant';
import { useAuth } from '../contexts/AuthContext';

const TenantPage = () => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');
  const { tenants, isLoading: loading, error, createTenant, updateTenant, deleteTenant } = useTenants();
  const { properties } = useProperties();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string | string[]>>({
    sortBy: 'localNumber'
  });
  const [actionError, setActionError] = useState('');

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
  const [createForm, setCreateForm] = useState({
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
  const [editForm, setEditForm] = useState({
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


  // Filtering and Sorting Logic
  const getFilteredAndSortedTenants = () => {
    let filtered = tenants;

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(tenant =>
        tenant.firstName.toLowerCase().includes(lowerQuery) ||
        tenant.lastName.toLowerCase().includes(lowerQuery) ||
        tenant.documentId.toLowerCase().includes(lowerQuery) ||
        tenant.phone?.toLowerCase().includes(lowerQuery) ||
        tenant.numeroLocal?.toLowerCase().includes(lowerQuery) ||
        tenant.rubro?.toLowerCase().includes(lowerQuery)
      );
    }

    const sortBy = filterValues.sortBy as string;

    // Helper to get min local number
    const getMinLocalNumber = (tenant: Tenant): number => {
      if (tenant.localNumbers && tenant.localNumbers.length > 0) {
        return Math.min(...tenant.localNumbers);
      }
      if (tenant.numeroLocal) {
        const parsed = parseInt(tenant.numeroLocal, 10);
        return isNaN(parsed) ? 999999 : parsed;
      }
      return 999999;
    };

    // Helper to get max local number
    const getMaxLocalNumber = (tenant: Tenant): number => {
      if (tenant.localNumbers && tenant.localNumbers.length > 0) {
        return Math.max(...tenant.localNumbers);
      }
      if (tenant.numeroLocal) {
        const parsed = parseInt(tenant.numeroLocal, 10);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'localNumber':
          return getMinLocalNumber(a) - getMinLocalNumber(b);
        case 'localNumber_desc':
          return getMaxLocalNumber(b) - getMaxLocalNumber(a);
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
  };

  const filteredTenants = getFilteredAndSortedTenants();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleFilterChange = (key: string, value: string | string[]) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilterValues({ sortBy: 'localNumber' });
  };

  const handleCreateTenant = async () => {
    try {
      setActionError('');
      const fechaInicioContrato = createForm.fechaInicioContrato?.trim() || undefined;

      const tenantData: CreateTenant = {
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        documentId: createForm.documentId,
        phone: createForm.phone || undefined,
        numeroLocal: createForm.numeroLocal || undefined,
        rubro: createForm.rubro || undefined,
        fechaInicioContrato: fechaInicioContrato
      };

      await createTenant(tenantData);

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
    } catch (err: any) {
      setActionError(err.message || 'Failed to create tenant');
    }
  };

  const handleUpdateTenant = async () => {
    if (!editingTenant) return;

    try {
      setActionError('');
      const fechaInicioContrato = editForm.fechaInicioContrato?.trim() || undefined;

      const tenantData: UpdateTenant = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone || undefined,
        documentId: editForm.documentId || undefined,
        numeroLocal: editForm.numeroLocal || undefined,
        rubro: editForm.rubro || undefined,
        fechaInicioContrato: fechaInicioContrato
      };

      await updateTenant({ id: editingTenant.id, data: tenantData });

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
      setActionError(err.message || 'Failed to update tenant');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!tenantToDelete) return;

    try {
      setActionError('');
      await deleteTenant(tenantToDelete.id);
      setDeleteDialogOpen(false);
      setTenantToDelete(null);
    } catch (err: any) {
      // If tenant has properties, showing modal or error
      if (err.code === 'TENANT_HAS_PROPERTIES') {
        // Would normally open the deletion modal, but for now simple alert
        setActionError(err.message);
        setDeleteDialogOpen(false);
        // Open info modal if we had one implemented in this version
        return;
      }
      setActionError(err.message || 'Failed to delete tenant');
    }
  };

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

  const handleDelete = (tenant: Tenant, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setTenantToDelete(tenant);
    setDeleteDialogOpen(true);
  };

  const formatDate = (_dateString: string) => {
    // Placeholder based on original code
    return '01/01/2025';
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const displayError = (error as Error)?.message || actionError;

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
                onClick={() => isAdmin && handleEdit(tenant)}
                sx={{ cursor: isAdmin ? 'pointer' : 'default', '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.12)' } }}
              >
                <TableCell>{tenant.firstName} {tenant.lastName}</TableCell>
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
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  {tenant.fechaInicioContrato ? formatDate(tenant.fechaInicioContrato) : '-'}
                </TableCell>
                <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                  <RoleGuard allowedRoles={['ADMIN']} fallback={<Typography variant="caption" color="text.secondary">Solo lectura</Typography>}>
                    <IconButton size="small" onClick={() => handleEdit(tenant)} color="primary"><EditIcon /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(tenant)} color="error"><DeleteIcon /></IconButton>
                  </RoleGuard>
                </TableCell>
              </TableRow>
            ))}
            {filteredTenants.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">No hay inquilinos registrados</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <RoleGuard allowedRoles={['ADMIN']}>
        <Fab
          color="primary"
          variant="extended"
          size="large"
          sx={{ position: 'fixed', bottom: 16, right: 16, px: 3, py: 1.5 }}
          onClick={() => setCreateDialogOpen(true)}
        >
          <AddIcon sx={{ mr: 1 }} />
          Agregar Inquilino
        </Fab>
      </RoleGuard>

      {/* Dialogs */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Agregar Inquilino</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField fullWidth label="Nombre" value={createForm.firstName} onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Apellido" value={createForm.lastName} onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Teléfono" value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} sx={{ mb: 2 }} />
            <TextField fullWidth label="DNI/Documento" value={createForm.documentId} onChange={(e) => setCreateForm({ ...createForm, documentId: e.target.value })} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Número de Local (opcional)" value={createForm.numeroLocal} onChange={(e) => setCreateForm({ ...createForm, numeroLocal: e.target.value })} sx={{ mb: 2 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Rubro</InputLabel>
              <Select value={createForm.rubro} label="Rubro" onChange={(e) => setCreateForm({ ...createForm, rubro: e.target.value })}>
                <MenuItem value="TIPEO">Tipeo</MenuItem>
                <MenuItem value="PEDICURE">Pedicure</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="Fecha Inicio" type="date" value={createForm.fechaInicioContrato} onChange={(e) => setCreateForm({ ...createForm, fechaInicioContrato: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <RoleGuard allowedRoles={['ADMIN']}>
            <Button onClick={handleCreateTenant} variant="contained">Crear</Button>
          </RoleGuard>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Editar Inquilino
          {editingTenant && (() => {
            const tenantProperty = properties.find(p => p.tenantId === editingTenant.id);
            return (
              <OpenPaymentsForTenantButton
                tenantId={editingTenant.id}
                propertyId={tenantProperty?.id}
                localNumber={tenantProperty?.localNumber}
                color="secondary"
                variant="contained"
                size="small"
              />
            );
          })()}
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField fullWidth label="Nombre" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Apellido" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Teléfono" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} sx={{ mb: 2 }} />
            <TextField fullWidth label="DNI/Documento" value={editForm.documentId} onChange={(e) => setEditForm({ ...editForm, documentId: e.target.value })} required sx={{ mb: 2 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Número de Local</InputLabel>
              <Select
                value={editForm.numeroLocal}
                label="Número de Local"
                onChange={(e) => setEditForm({ ...editForm, numeroLocal: e.target.value })}
              >
                <MenuItem value="">
                  <em>Ninguno</em>
                </MenuItem>
                {Array.from(new Set(properties.map(p => p.localNumber)))
                  .sort((a, b) => a - b)
                  .map(localNumber => (
                    <MenuItem key={localNumber} value={localNumber.toString()}>
                      {localNumber}
                    </MenuItem>
                  ))}
                {/* Incluir el número de local actual si no está en la lista */}
                {editingTenant?.numeroLocal &&
                  !properties.some(p => p.localNumber.toString() === editingTenant.numeroLocal) && (
                    <MenuItem value={editingTenant.numeroLocal}>
                      {editingTenant.numeroLocal} (no disponible)
                    </MenuItem>
                  )}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Rubro</InputLabel>
              <Select value={editForm.rubro} label="Rubro" onChange={(e) => setEditForm({ ...editForm, rubro: e.target.value })}>
                <MenuItem value="TIPEO">Tipeo</MenuItem>
                <MenuItem value="PEDICURE">Pedicure</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="Fecha Inicio" type="date" value={editForm.fechaInicioContrato} onChange={(e) => setEditForm({ ...editForm, fechaInicioContrato: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <RoleGuard allowedRoles={['ADMIN']}>
            <Button onClick={handleUpdateTenant} variant="contained">Actualizar</Button>
          </RoleGuard>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Seguro que desea eliminar a {tenantToDelete?.firstName} {tenantToDelete?.lastName}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Container >
  );
};

export default TenantPage;

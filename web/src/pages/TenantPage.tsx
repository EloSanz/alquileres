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
import { Add as AddIcon, Edit as EditIcon, Visibility as VisibilityIcon, Delete as DeleteIcon } from '@mui/icons-material';
import NavigationTabs from '../components/NavigationTabs';
import SearchBar from '../components/SearchBar';
import FilterBar, { type FilterConfig } from '../components/FilterBar';
import TenantDeletionModal from '../components/TenantDeletionModal';

interface Tenant {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
  documentId: string;
  numeroLocal?: string;
  rubro?: string;
  fechaInicioContrato?: string;
  estadoPago: string;
  createdAt: string;
}

interface CreateTenantData {
  firstName: string;
  lastName: string;
  phone?: string;
  documentId: string;
  numeroLocal?: string;
  rubro?: string;
  fechaInicioContrato?: string;
}

class TenantService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getAllTenants(): Promise<Tenant[]> {
    const response = await fetch('/api/tenants', {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tenants');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch tenants');
    }

    return data.data || [];
  }

  async getTenantById(id: number): Promise<Tenant> {
    const response = await fetch(`/api/tenants/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tenant');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch tenant');
    }

    return data.data;
  }

  async createTenant(tenantData: CreateTenantData): Promise<Tenant> {
    const response = await fetch('/api/tenants', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(tenantData),
    });

    if (!response.ok) {
      throw new Error('Failed to create tenant');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to create tenant');
    }

    return data.data;
  }

  async updateTenant(id: number, tenantData: Partial<CreateTenantData>): Promise<Tenant> {
    const response = await fetch(`/api/tenants/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(tenantData),
    });

    if (!response.ok) {
      throw new Error('Failed to update tenant');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to update tenant');
    }

    return data.data;
  }

  async deleteTenant(id: number): Promise<void> {
    const response = await fetch(`/api/tenants/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      let errorData: any;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch (e) {
          // If JSON parsing fails, use text response
          const textResponse = await response.text();
          errorData = { message: textResponse || 'Unknown error' };
        }
      } else {
        // Response is not JSON, use text
        const textResponse = await response.text();
        errorData = { message: textResponse || 'Unknown error' };
      }

      const error = new Error(errorData.message || 'Failed to delete tenant');
      (error as any).response = { data: errorData };
      throw error;
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete tenant');
    }
  }
}

import { propertyService } from '../services/propertyService';

const tenantService = new TenantService();

const TenantPage = () => {
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
        { value: 'lastName_desc', label: 'Apellido (Z-A)' }
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
  const [associatedProperties, setAssociatedProperties] = useState<Array<{
    id: number;
    name: string;
    address: string;
    city: string;
  }>>([]);
  const [associatedPayments, setAssociatedPayments] = useState<Array<{
    id: number;
    amount: number;
    paymentDate: string;
    dueDate: string;
    status: string;
    paymentType: string;
  }>>([]);

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
        tenant.numeroLocal?.toString().toLowerCase().includes(lowerQuery) ||
        tenant.rubro?.toLowerCase().includes(lowerQuery)
      );
    }

    // Aplicar ordenamiento
    const sortBy = filters.sortBy as string;
    filtered.sort((a, b) => {
      let aValue: string, bValue: string;

      switch (sortBy) {
        case 'firstName':
          aValue = a.firstName;
          bValue = b.firstName;
          break;
        case 'lastName':
          aValue = a.lastName;
          bValue = b.lastName;
          break;
        case 'firstName_desc':
          aValue = b.firstName;
          bValue = a.firstName;
          break;
        case 'lastName_desc':
          aValue = b.lastName;
          bValue = a.lastName;
          break;
        default:
          aValue = a.firstName;
          bValue = b.firstName;
      }

      return aValue.localeCompare(bValue);
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
      const tenantData: CreateTenantData = {
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        phone: createForm.phone || undefined,
        documentId: createForm.documentId,
        numeroLocal: createForm.numeroLocal || undefined,
        rubro: createForm.rubro || undefined,
        fechaInicioContrato: createForm.fechaInicioContrato || undefined,
      };

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

  useEffect(() => {
    fetchTenants();
  }, []);

  // Aplicar filtros y ordenamiento cuando cambien los criterios
  useEffect(() => {
    const filtered = filterAndSortTenants(searchQuery, filterValues, tenants);
    setFilteredTenants(filtered);
  }, [searchQuery, filterValues, tenants]);

  const handleViewDetails = (tenant: Tenant) => {
    // TODO: Navigate to tenant details page
    console.log('View details for tenant:', tenant.id);
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
      // Verificar si es respuesta estructurada del backend
      if (err.response?.data?.code === 'TENANT_HAS_PROPERTIES' && err.response?.data?.properties) {
        setAssociatedProperties(err.response.data.properties);
        setAssociatedPayments([]);
        setTenantDeletionModalOpen(true);
        setDeleteDialogOpen(false);
      } else if (err.response?.data?.code === 'TENANT_HAS_PAYMENTS' && err.response?.data?.payments) {
        setAssociatedPayments(err.response.data.payments);
        setAssociatedProperties([]);
        setTenantDeletionModalOpen(true);
        setDeleteDialogOpen(false);
      } else {
        setError(err.message || err.response?.data?.message || 'Failed to delete tenant');
      }
    }
  };

  const handlePropertyRelease = async (propertyId: number) => {
    await propertyService.releaseProperty(propertyId);
    // Refresh tenants data to reflect changes
    await fetchTenants();
  };

  const handlePaymentCancellation = async (paymentId: number) => {
    // For now, we'll implement a simple cancellation by updating the payment status
    // In a real implementation, you might want to create a separate endpoint for this
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/payments/${paymentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        status: 'CANCELLED',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel payment');
    }

    // Refresh tenants data to reflect changes
    await fetchTenants();
  };

  const handleUpdateTenant = async () => {
    if (!editingTenant) return;

    try {
      const tenantData: Partial<CreateTenantData> = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone || undefined,
        documentId: editForm.documentId,
        numeroLocal: editForm.numeroLocal || undefined,
        rubro: editForm.rubro || undefined,
        fechaInicioContrato: editForm.fechaInicioContrato || undefined,
      };

      await tenantService.updateTenant(editingTenant.id, tenantData);

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
      fetchTenants(); // Refresh the list
    } catch (err: any) {
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Inquilinos
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, maxWidth: 400 }}>
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
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Nombre</strong></TableCell>
                <TableCell><strong>Teléfono</strong></TableCell>
                <TableCell><strong>DNI</strong></TableCell>
                <TableCell><strong>N° Local</strong></TableCell>
                <TableCell><strong>Rubro</strong></TableCell>
                <TableCell><strong>Estado Pago</strong></TableCell>
                <TableCell><strong>Fecha Inicio</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id} hover>
                  <TableCell>{tenant.id}</TableCell>
                  <TableCell>
                    {tenant.firstName} {tenant.lastName}
                  </TableCell>
                  <TableCell>{tenant.phone || '-'}</TableCell>
                  <TableCell>{tenant.documentId}</TableCell>
                  <TableCell>{tenant.numeroLocal ?? '-'}</TableCell>
                  <TableCell>{tenant.rubro || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={tenant.estadoPago === 'AL_DIA' ? 'Al día' : 'Con deuda'}
                      color={tenant.estadoPago === 'AL_DIA' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{tenant.fechaInicioContrato ? formatDate(tenant.fechaInicioContrato) : '-'}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(tenant)}
                      title="Ver detalles"
                    >
                      <VisibilityIcon />
                    </IconButton>
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
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Create Tenant Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Crear Nuevo Inquilino</DialogTitle>
        <DialogContent>
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
              label="Número de Local"
              value={createForm.numeroLocal}
              onChange={(e) => setCreateForm({ ...createForm, numeroLocal: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Rubro</InputLabel>
              <Select
                value={createForm.rubro}
                label="Rubro"
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
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
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
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleUpdateTenant} variant="contained">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
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
        properties={associatedProperties}
        payments={associatedPayments}
        onPropertyRelease={handlePropertyRelease}
        onPaymentCancellation={handlePaymentCancellation}
        onClose={() => setTenantDeletionModalOpen(false)}
        onRefresh={fetchTenants}
      />
    </Container>
  );
};

export default TenantPage;

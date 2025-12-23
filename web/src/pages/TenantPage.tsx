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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Visibility as VisibilityIcon, Delete as DeleteIcon } from '@mui/icons-material';
import NavigationTabs from '../components/NavigationTabs';

interface Tenant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  documentId: string;
  createdAt: string;
}

interface CreateTenantData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  documentId: string;
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
      throw new Error('Failed to delete tenant');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete tenant');
    }
  }
}

const tenantService = new TenantService();

const TenantPage = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    documentId: '',
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    documentId: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(''); // Limpiar error anterior
      const data = await tenantService.getAllTenants();
      setTenants(data);
    } catch (err: any) {
      // Solo mostrar error si es un error real de red/API, no si es array vacío
      if (err.message && !err.message.includes('fetch')) {
        setError(err.message);
      }
      // Si es array vacío, no es error - simplemente no hay datos
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async () => {
    try {
      const tenantData: CreateTenantData = {
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        email: createForm.email,
        phone: createForm.phone || undefined,
        documentId: createForm.documentId,
      };

      await tenantService.createTenant(tenantData);

      setCreateDialogOpen(false);
      setCreateForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        documentId: '',
      });
      fetchTenants(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to create tenant');
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleViewDetails = (tenant: Tenant) => {
    // TODO: Navigate to tenant details page
    console.log('View details for tenant:', tenant.id);
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setEditForm({
      firstName: tenant.firstName,
      lastName: tenant.lastName,
      email: tenant.email,
      phone: tenant.phone || '',
      documentId: tenant.documentId,
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
      setError(err.message || 'Failed to delete tenant');
    }
  };

  const handleUpdateTenant = async () => {
    if (!editingTenant) return;

    try {
      const tenantData: Partial<CreateTenantData> = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone || undefined,
        documentId: editForm.documentId,
      };

      await tenantService.updateTenant(editingTenant.id, tenantData);

      setEditDialogOpen(false);
      setEditingTenant(null);
      setEditForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        documentId: '',
      });
      fetchTenants(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to update tenant');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Inquilinos
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
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Teléfono</strong></TableCell>
                <TableCell><strong>DNI</strong></TableCell>
                <TableCell><strong>Fecha Registro</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id} hover>
                  <TableCell>
                    {tenant.firstName} {tenant.lastName}
                  </TableCell>
                  <TableCell>{tenant.email}</TableCell>
                  <TableCell>{tenant.phone || '-'}</TableCell>
                  <TableCell>{tenant.documentId}</TableCell>
                  <TableCell>{formatDate(tenant.createdAt)}</TableCell>
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
              label="Email"
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
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
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
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
    </Container>
  );
};

export default TenantPage;

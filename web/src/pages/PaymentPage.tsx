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
  Autocomplete,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Visibility as VisibilityIcon, Delete as DeleteIcon } from '@mui/icons-material';
import NavigationTabs from '../components/NavigationTabs';
import { propertyService, type Property } from '../services/propertyService';
import SearchBar from '../components/SearchBar';
import FilterBar, { FilterConfig } from '../components/FilterBar';

interface Payment {
  id: number;
  tenantId: number;
  propertyId: number;
  amount: number;
  paymentDate: string;
  dueDate: string;
  paymentType: string;
  status: string;
  notes?: string;
  createdAt: string;
}

interface CreatePaymentData {
  tenantId: number;
  propertyId: number;
  amount: number;
  paymentDate?: string;
  dueDate: string;
  paymentType: string;
  status?: string;
  notes?: string;
}

class PaymentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getAllPayments(): Promise<Payment[]> {
    const response = await fetch('/api/payments', {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch payments');
    }

    return data.data || [];
  }

  async getPaymentById(id: number): Promise<Payment> {
    const response = await fetch(`/api/payments/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch payment');
    }

    return data.data;
  }

  async createPayment(paymentData: CreatePaymentData): Promise<Payment> {
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to create payment');
    }

    return data.data;
  }

  async updatePayment(id: number, paymentData: Partial<CreatePaymentData>): Promise<Payment> {
    const response = await fetch(`/api/payments/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error('Failed to update payment');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to update payment');
    }

    return data.data;
  }

  async deletePayment(id: number): Promise<void> {
    const response = await fetch(`/api/payments/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete payment');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete payment');
    }
  }
}

const paymentService = new PaymentService();

const PaymentPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string | string[]>>({
    status: '',
    paymentType: ''
  });

  const paymentFilters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Estado',
      options: [
        { value: 'PENDIENTE', label: 'Pendiente' },
        { value: 'COMPLETADO', label: 'Completado' },
        { value: 'VENCIDO', label: 'Vencido' },
        { value: 'CANCELADO', label: 'Cancelado' }
      ]
    },
    {
      key: 'paymentType',
      label: 'Tipo',
      options: [
        { value: 'RENT', label: 'Alquiler' },
        { value: 'DEPOSIT', label: 'Depósito' },
        { value: 'MAINTENANCE', label: 'Mantenimiento' },
        { value: 'LATE_FEE', label: 'Multa' },
        { value: 'OTHER', label: 'Otro' }
      ]
    }
  ];

  // Función para convertir estados del backend (inglés) al frontend (español)
  const convertStatusToSpanish = (englishStatus: string): string => {
    switch (englishStatus.toUpperCase()) {
      case 'PENDING':
        return 'PENDIENTE';
      case 'COMPLETED':
        return 'COMPLETADO';
      case 'OVERDUE':
        return 'VENCIDO';
      case 'CANCELLED':
        return 'CANCELADO';
      default:
        return englishStatus;
    }
  };

  // Función para convertir estados del frontend (español) al backend (inglés)
  const convertStatusToEnglish = (spanishStatus: string): string => {
    switch (spanishStatus.toUpperCase()) {
      case 'PENDIENTE':
        return 'PENDING';
      case 'COMPLETADO':
        return 'COMPLETED';
      case 'VENCIDO':
        return 'OVERDUE';
      case 'CANCELADO':
        return 'CANCELLED';
      default:
        return spanishStatus;
    }
  };
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [amountError, setAmountError] = useState('');
  const [createForm, setCreateForm] = useState({
    tenantId: '',
    propertyId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días por defecto
    paymentType: 'RENT',
    status: 'PENDIENTE',
    notes: '',
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editForm, setEditForm] = useState({
    tenantId: '',
    propertyId: '',
    amount: '',
    paymentDate: '',
    dueDate: '',
    paymentType: 'RENT',
    status: 'PENDIENTE',
    notes: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(''); // Limpiar error anterior
      const data = await paymentService.getAllPayments();
      // Convertir estados al español para el frontend
      const convertedData = data.map(payment => ({
        ...payment,
        status: convertStatusToSpanish(payment.status)
      }));
      setPayments(convertedData);
      const filtered = filterPayments(searchQuery, filterValues, convertedData);
      setFilteredPayments(filtered);
    } catch (err: any) {
      // Solo mostrar error si es un error real de red/API, no si es array vacío
      if (err.message && !err.message.includes('fetch')) {
        setError(err.message);
      }
      // Si es array vacío, no es error - simplemente no hay datos
      setPayments([]);
      setFilteredPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = (query: string, filters: Record<string, string | string[]>, paymentsList: Payment[]) => {
    return paymentsList.filter(payment => {
      // Filtro de búsqueda por texto
      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        const matchesQuery =
          payment.amount.toString().includes(lowerQuery) ||
          payment.status.toLowerCase().includes(lowerQuery) ||
          payment.paymentType.toLowerCase().includes(lowerQuery) ||
          payment.notes?.toLowerCase().includes(lowerQuery) ||
          new Date(payment.paymentDate).toLocaleDateString('es-ES').toLowerCase().includes(lowerQuery) ||
          new Date(payment.dueDate).toLocaleDateString('es-ES').toLowerCase().includes(lowerQuery);

        if (!matchesQuery) return false;
      }

      // Filtro por estado
      if (filters.status && payment.status !== filters.status) {
        return false;
      }

      // Filtro por tipo de pago
      if (filters.paymentType && payment.paymentType !== filters.paymentType) {
        return false;
      }

      return true;
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    const filtered = filterPayments(query, filterValues, payments);
    setFilteredPayments(filtered);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    const filtered = filterPayments('', filterValues, payments);
    setFilteredPayments(filtered);
  };

  const handleFilterChange = (key: string, value: string | string[]) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    const filtered = filterPayments(searchQuery, newFilters, payments);
    setFilteredPayments(filtered);
  };

  const handleClearFilters = () => {
    const newFilters = { status: '', paymentType: '' };
    setFilterValues(newFilters);
    const filtered = filterPayments(searchQuery, newFilters, payments);
    setFilteredPayments(filtered);
  };

  const fetchProperties = async () => {
    try {
      setPropertiesLoading(true);
      const data = await propertyService.getAllProperties();
      setProperties(data);
    } catch (err: any) {
      console.error('Failed to fetch properties:', err);
      // No mostrar error en UI ya que es secundario
    } finally {
      setPropertiesLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    // Validar monto antes de enviar
    const amountError = validateAmount(createForm.amount);
    if (amountError) {
      setAmountError(amountError);
      return;
    }

    if (!selectedProperty) {
      setError('Debe seleccionar una propiedad');
      return;
    }

    try {
      const paymentData: CreatePaymentData = {
        tenantId: selectedProperty.tenantId,
        propertyId: selectedProperty.id,
        amount: parseFloat(createForm.amount),
        paymentDate: createForm.paymentDate,
        dueDate: createForm.dueDate,
        paymentType: createForm.paymentType,
        status: convertStatusToEnglish(createForm.status),
        notes: createForm.notes || undefined,
      };

      await paymentService.createPayment(paymentData);

      setCreateDialogOpen(false);
      setSelectedProperty(null);
      setAmountError('');
      setCreateForm({
        tenantId: '',
        propertyId: '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días por defecto
        paymentType: 'RENT',
        status: 'PENDIENTE',
        notes: '',
      });
      fetchPayments(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to create payment');
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchProperties();
  }, []);

  // Aplicar filtros cuando cambien los criterios
  useEffect(() => {
    const filtered = filterPayments(searchQuery, filterValues, payments);
    setFilteredPayments(filtered);
  }, [searchQuery, filterValues, payments]);

  const validateAmount = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return 'El monto debe ser un número válido';
    }
    if (num < 0) {
      return 'El monto no puede ser negativo';
    }
    if (num === 0) {
      return 'El monto debe ser mayor a cero';
    }
    return '';
  };

  const handleAmountChange = (value: string) => {
    setCreateForm({ ...createForm, amount: value });
    const error = validateAmount(value);
    setAmountError(error);
  };

  const handleViewDetails = (payment: Payment) => {
    // TODO: Navigate to payment details page
    console.log('View details for payment:', payment.id);
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setEditForm({
      tenantId: payment.tenantId.toString(),
      propertyId: payment.propertyId.toString(),
      amount: payment.amount.toString(),
      paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
      dueDate: new Date(payment.dueDate).toISOString().split('T')[0],
      paymentType: payment.paymentType || 'RENT',
      status: payment.status, // Ya está convertido al español
      notes: payment.notes || '',
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (payment: Payment) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;

    try {
      await paymentService.deletePayment(paymentToDelete.id);
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
      fetchPayments(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to delete payment');
    }
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment) return;

    try {
      const paymentData: Partial<CreatePaymentData> = {
        tenantId: parseInt(editForm.tenantId),
        propertyId: parseInt(editForm.propertyId),
        amount: parseFloat(editForm.amount),
        paymentDate: editForm.paymentDate,
        dueDate: editForm.dueDate,
        paymentType: editForm.paymentType,
        status: convertStatusToEnglish(editForm.status),
        notes: editForm.notes || undefined,
      };

      await paymentService.updatePayment(editingPayment.id, paymentData);

      setEditDialogOpen(false);
      setEditingPayment(null);
      setEditForm({
        tenantId: '',
        propertyId: '',
        amount: '',
        paymentDate: '',
        dueDate: '',
        paymentType: 'RENT',
        status: 'PENDIENTE',
        notes: '',
      });
      fetchPayments(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to update payment');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completado':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'vencido':
        return 'error';
      case 'cancelado':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Pagos
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, maxWidth: 400 }}>
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onClearSearch={handleClearSearch}
              placeholder="Buscar por monto, estado, tipo..."
              label="Buscar pagos"
            />
          </Box>
          <FilterBar
            filters={paymentFilters}
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
                <TableCell><strong>Inquilino - Propiedad</strong></TableCell>
                <TableCell><strong>Monto</strong></TableCell>
                <TableCell><strong>Fecha Pago</strong></TableCell>
                <TableCell><strong>Fecha Vencimiento</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id} hover>
                  <TableCell>Inq: {payment.tenantId} - Prop: {payment.propertyId}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                  <TableCell>{formatDate(payment.dueDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status}
                      color={getPaymentStatusColor(payment.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(payment)}
                      title="Ver detalles"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(payment)}
                      title="Editar"
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(payment)}
                      title="Eliminar"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay pagos registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Floating Action Button for creating new payment */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Create Payment Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Crear Nuevo Pago</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Autocomplete
              fullWidth
              options={properties}
              getOptionLabel={(property) =>
                `${property.name} - ${property.address}, ${property.tenant?.firstName || ''} ${property.tenant?.lastName || ''} (${property.monthlyRent} S/)`
              }
              value={selectedProperty}
              onChange={(_, newValue) => {
                setSelectedProperty(newValue);
                if (newValue) {
                  setCreateForm({
                    ...createForm,
                    tenantId: newValue.tenantId.toString(),
                    propertyId: newValue.id.toString()
                  });
                } else {
                  setCreateForm({
                    ...createForm,
                    tenantId: '',
                    propertyId: ''
                  });
                }
              }}
              loading={propertiesLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Seleccionar Propiedad"
                  required
                  sx={{ mb: 2 }}
                  helperText="Busque por nombre de propiedad, dirección o nombre del inquilino"
                />
              )}
              noOptionsText="No se encontraron propiedades"
              loadingText="Cargando propiedades..."
            />
            <TextField
              fullWidth
              label="Monto (S/)"
              type="number"
              value={createForm.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              error={!!amountError}
              helperText={amountError}
              required
              sx={{ mb: 2 }}
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              fullWidth
              label="Fecha de Pago"
              type="date"
              value={createForm.paymentDate}
              onChange={(e) => setCreateForm({ ...createForm, paymentDate: e.target.value })}
              required
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Fecha de Vencimiento"
              type="date"
              value={createForm.dueDate}
              onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
              required
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              fullWidth
              label="Tipo de Pago"
              value={createForm.paymentType}
              onChange={(e) => setCreateForm({ ...createForm, paymentType: e.target.value })}
              required
              sx={{ mb: 2 }}
            >
              <MenuItem value="RENT">Alquiler</MenuItem>
              <MenuItem value="DEPOSIT">Depósito</MenuItem>
              <MenuItem value="MAINTENANCE">Mantenimiento</MenuItem>
                <MenuItem value="UTILITIES">Servicios Públicos</MenuItem>
              <MenuItem value="OTHER">Otro</MenuItem>
            </TextField>
            <TextField
              select
              fullWidth
              label="Estado"
              value={createForm.status}
              onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
              sx={{ mb: 2 }}
            >
              <MenuItem value="PENDIENTE">Pendiente</MenuItem>
              <MenuItem value="COMPLETADO">Completado</MenuItem>
              <MenuItem value="VENCIDO">Vencido</MenuItem>
              <MenuItem value="CANCELADO">Cancelado</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Notas"
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleCreatePayment}
            variant="contained"
            disabled={!selectedProperty || !!amountError || !createForm.amount}
          >
            Crear Pago
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Editar Pago</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="ID del Inquilino"
              type="number"
              value={editForm.tenantId}
              onChange={(e) => setEditForm({ ...editForm, tenantId: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="ID de la Propiedad"
              type="number"
              value={editForm.propertyId}
              onChange={(e) => setEditForm({ ...editForm, propertyId: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Monto (S/)"
              type="number"
              value={editForm.amount}
              onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Fecha de Pago"
              type="date"
              value={editForm.paymentDate}
              onChange={(e) => setEditForm({ ...editForm, paymentDate: e.target.value })}
              required
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Fecha de Vencimiento"
              type="date"
              value={editForm.dueDate}
              onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
              required
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              fullWidth
              label="Tipo de Pago"
              value={editForm.paymentType}
              onChange={(e) => setEditForm({ ...editForm, paymentType: e.target.value })}
              required
              sx={{ mb: 2 }}
            >
              <MenuItem value="RENT">Alquiler</MenuItem>
              <MenuItem value="DEPOSIT">Depósito</MenuItem>
              <MenuItem value="MAINTENANCE">Mantenimiento</MenuItem>
                <MenuItem value="UTILITIES">Servicios Públicos</MenuItem>
              <MenuItem value="OTHER">Otro</MenuItem>
            </TextField>
            <TextField
              select
              fullWidth
              label="Estado"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              sx={{ mb: 2 }}
            >
              <MenuItem value="PENDIENTE">Pendiente</MenuItem>
              <MenuItem value="COMPLETADO">Completado</MenuItem>
              <MenuItem value="VENCIDO">Vencido</MenuItem>
              <MenuItem value="CANCELADO">Cancelado</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Notas"
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleUpdatePayment} variant="contained">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar este pago de{' '}
            <strong>{formatCurrency(paymentToDelete?.amount || 0)}</strong>?
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

export default PaymentPage;

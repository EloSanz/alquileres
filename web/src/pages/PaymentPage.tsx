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
  IconButton,
  Autocomplete,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Visibility as VisibilityIcon, Delete as DeleteIcon } from '@mui/icons-material';
import NavigationTabs from '../components/NavigationTabs';
import { usePropertyService, type Property } from '../services/propertyService';
import { usePaymentService, type Payment, type CreatePaymentData } from '../services/paymentService';
import SearchBar from '../components/SearchBar';
import FilterBar, { FilterConfig } from '../components/FilterBar';

const PaymentPage = () => {
  const propertyService = usePropertyService()
  const paymentService = usePaymentService()
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string | string[]>>({
    paymentMethod: ''
  });

  const paymentFilters: FilterConfig[] = [
    {
      key: 'paymentMethod',
      label: 'Medio de Pago',
      options: [
        { value: 'YAPE', label: 'Yape' },
        { value: 'DEPOSITO', label: 'Depósito' },
        { value: 'TRANSFERENCIA_VIRTUAL', label: 'Transferencia Virtual' }
      ]
    }
  ];
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
    paymentMethod: 'YAPE',
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
    paymentMethod: 'YAPE',
    notes: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  // Toggle Pentamont persisted in backend
  const handleTogglePentamont = async (payment: Payment) => {
    try {
      const next = !payment.pentamontSettled;
      await paymentService.updatePayment(payment.id, { pentamontSettled: next });
      setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, pentamontSettled: next } as Payment : p));
      setFilteredPayments(prev => prev.map(p => p.id === payment.id ? { ...p, pentamontSettled: next } as Payment : p));
    } catch (e: any) {
      setError(e?.message || 'No se pudo actualizar Pentamont');
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(''); // Limpiar error anterior
      const data = await paymentService.getAllPayments();
      setPayments(data);
      const filtered = filterPayments(searchQuery, filterValues, data);
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

  const filterPayments = (query: string, _filters: Record<string, string | string[]>, paymentsList: Payment[]) => {
    return paymentsList.filter(payment => {
      // Filtro de búsqueda por texto
      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        const matchesQuery =
          payment.amount.toString().includes(lowerQuery) ||
          payment.tenantFullName?.toLowerCase().includes(lowerQuery) ||
          payment.paymentMethod?.toLowerCase().includes(lowerQuery) ||
          payment.notes?.toLowerCase().includes(lowerQuery) ||
          new Date(payment.paymentDate).toLocaleDateString('es-ES').toLowerCase().includes(lowerQuery) ||
          new Date(payment.dueDate).toLocaleDateString('es-ES').toLowerCase().includes(lowerQuery);

        if (!matchesQuery) return false;
      }

      // Filtro por medio de pago
      if (_filters.paymentMethod && payment.paymentMethod !== _filters.paymentMethod) {
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
    const newFilters = { paymentMethod: '' };
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
        tenantId: selectedProperty.tenantId || undefined,
        propertyId: selectedProperty.id,
        amount: parseFloat(createForm.amount),
        paymentDate: createForm.paymentDate,
        dueDate: createForm.dueDate,
        paymentMethod: createForm.paymentMethod,
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
        paymentMethod: 'YAPE',
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
      tenantId: payment.tenantId?.toString() || '',
      propertyId: payment.propertyId?.toString() || '',
      amount: payment.amount.toString(),
      paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
      dueDate: new Date(payment.dueDate).toISOString().split('T')[0],
      paymentMethod: payment.paymentMethod || 'YAPE',
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
        paymentMethod: editForm.paymentMethod,
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
        paymentMethod: 'YAPE',
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
              placeholder="Buscar por monto, inquilino, medio de pago, notas..."
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
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Inquilino</strong></TableCell>
                <TableCell><strong>Monto</strong></TableCell>
                <TableCell><strong>Fecha Pago</strong></TableCell>
                <TableCell><strong>Fecha Vencimiento</strong></TableCell>
                <TableCell><strong>Medio de Pago</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id} hover>
                  <TableCell>{payment.id}</TableCell>
                  <TableCell>{payment.tenantFullName || `ID: ${payment.tenantId}`}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                  <TableCell>{formatDate(payment.dueDate)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {payment.paymentMethod === 'YAPE' ? 'Yape' :
                         payment.paymentMethod === 'DEPOSITO' ? 'Depósito' :
                         payment.paymentMethod === 'TRANSFERENCIA_VIRTUAL' ? 'Transferencia Virtual' :
                         payment.paymentMethod}
                      </Typography>
                      {payment.paymentMethod === 'YAPE' && (
                        <FormControlLabel
                          sx={{ ml: 1 }}
                          label={`Pentamont: ${payment.pentamontSettled ? 'Sí' : 'No'}`}
                          control={
                            <Switch
                              size="small"
                              checked={!!payment.pentamontSettled}
                              onChange={() => handleTogglePentamont(payment)}
                            />
                          }
                        />
                      )}
                    </Box>
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
                `${property.name} - Local N° ${property.localNumber}, ${property.tenant?.firstName || ''} ${property.tenant?.lastName || ''} (${property.monthlyRent} S/)`
              }
              value={selectedProperty}
              onChange={(_, newValue) => {
                setSelectedProperty(newValue);
                if (newValue) {
                  setCreateForm({
                    ...createForm,
                    tenantId: newValue.tenantId?.toString() || '',
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
                  label="Seleccionar Local"
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
              label="Medio de Pago"
              value={createForm.paymentMethod}
              onChange={(e) => setCreateForm({ ...createForm, paymentMethod: e.target.value })}
              required
              sx={{ mb: 2 }}
            >
              <MenuItem value="YAPE">Yape</MenuItem>
              <MenuItem value="DEPOSITO">Depósito</MenuItem>
              <MenuItem value="TRANSFERENCIA_VIRTUAL">Transferencia Virtual</MenuItem>
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
              label="ID del Local"
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
              label="Medio de Pago"
              value={editForm.paymentMethod}
              onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
              required
              sx={{ mb: 2 }}
            >
              <MenuItem value="YAPE">Yape</MenuItem>
              <MenuItem value="DEPOSITO">Depósito</MenuItem>
              <MenuItem value="TRANSFERENCIA_VIRTUAL">Transferencia Virtual</MenuItem>
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

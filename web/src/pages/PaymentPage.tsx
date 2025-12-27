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
  IconButton,
  Autocomplete,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import NavigationTabs from '../components/NavigationTabs';
import { usePropertyService } from '../services/propertyService';
import { Property } from '../../../shared/types/Property';
import { usePaymentService } from '../services/paymentService';
import { useTenantService } from '../services/tenantService';
import { Payment, CreatePayment, UpdatePayment } from '../../../shared/types/Payment';
import { Tenant } from '../../../shared/types/Tenant';
import SearchBar from '../components/SearchBar';
import FilterBar, { FilterConfig } from '../components/FilterBar';
import PaymentDetailsModal from '../components/PaymentDetailsModal';

const PaymentPage = () => {
  const propertyService = usePropertyService()
  const paymentService = usePaymentService()
  const tenantService = useTenantService()
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string | string[]>>({
    paymentMethod: '',
    status: ''
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
    },
    {
      key: 'status',
      label: 'Estado',
      options: [
        { value: 'PAGADO', label: 'Pagado' },
        { value: 'VENCIDO', label: 'Vencido' },
        { value: 'FUTURO', label: 'Futuro' }
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
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [receiptImageFile, setReceiptImageFile] = useState<File | null>(null);
  const [receiptImagePreview, setReceiptImagePreview] = useState<string | null>(null);

  // Toggle Pentamont persisted in backend
  const handleTogglePentamont = async (payment: Payment) => {
    try {
      const next = !payment.pentamontSettled;
      const updateData = new UpdatePayment(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, next, undefined);
      await paymentService.updatePayment(payment.id, updateData);
      setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, pentamontSettled: next } as Payment : p));
      setFilteredPayments(prev => prev.map(p => p.id === payment.id ? { ...p, pentamontSettled: next } as Payment : p));
    } catch (e: any) {
      setError(e?.message || 'No se pudo actualizar Pentamont');
    }
  };

  const fetchPayments = async (tenantId?: number | null) => {
    try {
      setLoading(true);
      setError(''); // Limpiar error anterior
      const targetTenantId = tenantId !== undefined ? tenantId : selectedTenantId;
      let data: Payment[];
      
      if (targetTenantId !== null && targetTenantId !== undefined) {
        // Cargar solo pagos del inquilino seleccionado
        data = await paymentService.getPaymentsByTenantId(targetTenantId);
      } else {
        // Si no hay inquilino seleccionado, cargar todos (fallback)
        data = await paymentService.getAllPayments();
      }
      
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

      // Filtro por status
      if (_filters.status && payment.status !== _filters.status) {
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

  const fetchTenants = async () => {
    try {
      const data = await tenantService.getAllTenants();
      setTenants(data);
      // Seleccionar el primer inquilino por defecto
      if (data.length > 0 && selectedTenantId === null) {
        setSelectedTenantId(data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to fetch tenants:', err);
      // No mostrar error en UI ya que es secundario
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
      const tenantId = selectedProperty.tenantId;
      if (!tenantId) {
        setError('La propiedad seleccionada no tiene un inquilino asignado');
        return;
      }
      
      const paymentData = new CreatePayment(
        tenantId,
        selectedProperty.id,
        parseFloat(createForm.amount),
        createForm.dueDate,
        createForm.paymentDate,
        createForm.paymentMethod,
        undefined, // status - se calculará automáticamente
        undefined, // pentamontSettled
        createForm.notes || undefined
      );
      (paymentData as any).receiptImage = receiptImageFile || null; // Para mantener compatibilidad con CreatePaymentData
      
      await paymentService.createPayment(paymentData as any);

      setCreateDialogOpen(false);
      setSelectedProperty(null);
      setAmountError('');
      setReceiptImageFile(null);
      setReceiptImagePreview(null);
      setCreateForm({
        tenantId: '',
        propertyId: '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días por defecto
        paymentMethod: 'YAPE',
        notes: '',
      });
      fetchPayments(selectedTenantId); // Refresh the list manteniendo el filtro de inquilino
    } catch (err: any) {
      setError(err.message || 'Failed to create payment');
    }
  };

  const hasFetchedRef = useRef(false);
  
  useEffect(() => {
    const loadInitialData = async () => {
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;
      
      // Cargar inquilinos primero
      await fetchTenants();
      // Luego cargar propiedades
      await fetchProperties();
      // Los pagos se cargarán cuando se seleccione el primer inquilino
    };
    
    loadInitialData();
  }, []);

  // Cargar pagos cuando cambie el inquilino seleccionado
  useEffect(() => {
    if (selectedTenantId !== null && tenants.length > 0) {
      fetchPayments(selectedTenantId);
    }
  }, [selectedTenantId]);

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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReceiptImageFile(file);
      // Crear preview de la imagen seleccionada
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setReceiptImageFile(null);
    setReceiptImagePreview(null);
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
      fetchPayments(selectedTenantId); // Refresh the list manteniendo el filtro de inquilino
    } catch (err: any) {
      setError(err.message || 'Failed to delete payment');
    }
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment) return;

    try {
      const paymentData = new UpdatePayment(
        parseInt(editForm.tenantId),
        parseInt(editForm.propertyId),
        undefined,
        undefined,
        undefined,
        undefined,
        parseFloat(editForm.amount),
        editForm.paymentDate,
        editForm.dueDate,
        editForm.paymentMethod,
        undefined, // status - se recalculará automáticamente
        undefined, // pentamontSettled
        editForm.notes || undefined
      );

      await paymentService.updatePayment(editingPayment.id, paymentData);

      // Recargar pagos desde el servidor para mantener consistencia con el filtro de inquilino
      await fetchPayments(selectedTenantId);

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
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: { xs: 'block', sm: 'flex' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: 2 
        }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Pagos
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap', mb: 2 }}>
          {tenants.length > 0 && (
            <TextField
              select
              label="Filtrar por Inquilino"
              value={selectedTenantId || ''}
              onChange={(e) => setSelectedTenantId(Number(e.target.value))}
              sx={{ minWidth: { xs: '100%', sm: 250 }, maxWidth: { xs: '100%', sm: 300 } }}
            >
              {tenants.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  {tenant.firstName} {tenant.lastName}
                  {tenant.localNumbers && tenant.localNumbers.length > 0 && (
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      (Locales: {tenant.localNumbers.join(', ')})
                    </Typography>
                  )}
                </MenuItem>
              ))}
            </TextField>
          )}
          <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 250 }, maxWidth: { xs: '100%', sm: 400 } }}>
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
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Inquilino</strong></TableCell>
                <TableCell><strong>Monto</strong></TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><strong>Fecha Pago</strong></TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><strong>Fecha Vencimiento</strong></TableCell>
                <TableCell><strong>Medio de Pago</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow 
                  key={payment.id} 
                  hover
                  onClick={() => {
                    setSelectedPayment(payment);
                    setDetailsModalOpen(true);
                  }}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.12)'
                    }
                  }}
                >
                  <TableCell>{payment.tenantFullName || `ID: ${payment.tenantId}`}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{formatDate(payment.paymentDate)}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{formatDate(payment.dueDate)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
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
                              onChange={(e) => {
                                e.stopPropagation();
                                handleTogglePentamont(payment);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(payment);
                      }}
                      title="Editar"
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(payment);
                      }}
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
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
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
        Agregar Pago
      </Fab>

      {/* Create Payment Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => {
          setCreateDialogOpen(false);
          setReceiptImageFile(null);
          setReceiptImagePreview(null);
        }} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Agregar Pago</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box component="form" sx={{ mt: 2 }}>
            <Autocomplete
              fullWidth
              options={properties}
              getOptionLabel={(property) =>
                `Local N° ${property.localNumber} - ${property.ubicacion === 'BOULEVAR' ? 'Boulevard' : property.ubicacion === 'SAN_MARTIN' ? 'San Martin' : property.ubicacion}, ${property.tenant?.firstName || ''} ${property.tenant?.lastName || ''} (${property.monthlyRent} S/)`
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
              sx={{ mb: 2 }}
            />
            
            {/* Upload de Comprobante */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Comprobante de Pago
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="receipt-image-upload"
                type="file"
                onChange={handleImageChange}
                key={receiptImageFile ? receiptImageFile.name : 'file-input'}
              />
              <label htmlFor="receipt-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {receiptImageFile ? receiptImageFile.name : 'Seleccionar Imagen del Comprobante'}
                </Button>
              </label>
              
              {/* Preview de la imagen */}
              {receiptImagePreview && (
                <Box sx={{ mt: 2, position: 'relative' }}>
                  <Box
                    component="img"
                    src={receiptImagePreview}
                    alt="Preview del comprobante"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      p: 1,
                      bgcolor: 'grey.50',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={handleRemoveImage}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Por ahora, cualquier imagen seleccionada será mockeada y se usará la imagen de prueba
              </Typography>
            </Box>
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
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
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
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
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

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        open={detailsModalOpen}
        payment={selectedPayment}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedPayment(null);
        }}
      />
    </Container>
  );
};

export default PaymentPage;

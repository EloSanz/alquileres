import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  IconButton,
  Autocomplete,
} from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as CloudUploadIcon, ViewModule as ViewModuleIcon, TableChart as TableChartIcon } from '@mui/icons-material';
import NavigationTabs from '../components/NavigationTabs';
import { Property } from '../../../shared/types/Property';
import { usePaymentService } from '../services/paymentService';
import { useDataGateway } from '../gateways/useDataGateway';
import { Payment, CreatePayment, UpdatePayment } from '../../../shared/types/Payment';
import EditPaymentModal from '../components/EditPaymentModal';
import SearchBar from '../components/SearchBar';
import FilterBar, { FilterConfig } from '../components/FilterBar';
import PaymentDetailsModal from '../components/PaymentDetailsModal';
import PaymentTable from '../components/PaymentTable';
import PaymentByPropertyView from '../components/PaymentByPropertyView';

const PaymentPage = () => {
  const paymentService = usePaymentService()
  const dataGateway = useDataGateway()
  const location = useLocation();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [receiptImageFile, setReceiptImageFile] = useState<File | null>(null);
  const [receiptImagePreview, setReceiptImagePreview] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [deepLinkPropertyId, setDeepLinkPropertyId] = useState<number | undefined>(undefined);

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

  const fetchPayments = (tenantId?: number | null) => {
    try {
      setError('');
      const targetTenantId = tenantId !== undefined ? tenantId : selectedTenantId;
      let data: Payment[];
      
      // Usar DataGateway para obtener datos desde cache
      if (targetTenantId !== null && targetTenantId !== undefined) {
        data = dataGateway.getPaymentsByTenantId(targetTenantId);
      } else {
        data = dataGateway.getPayments();
      }
      
      setPayments(data);
      const filtered = filterPayments(searchQuery, filterValues, data);
      setFilteredPayments(filtered);
    } catch (err: any) {
      setError(err.message || 'Error al cargar pagos');
      setPayments([]);
      setFilteredPayments([]);
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

  // Los tenants y properties ahora vienen del DataGateway
  const tenants = dataGateway.getTenants();

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
      // Invalidar cache y recargar desde el servicio
      dataGateway.invalidate();
      await dataGateway.loadAll();
      fetchPayments(selectedTenantId);
    } catch (err: any) {
      setError(err.message || 'Failed to create payment');
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
        // Seleccionar el primer inquilino por defecto si hay tenants disponibles
        if (tenants.length > 0 && selectedTenantId === null) {
          setSelectedTenantId(tenants[0].id);
        }
        fetchPayments(selectedTenantId);
      }
    };
    
    loadData();
  }, [dataGateway]);
  
  // Leer query params de deep-link: /payments?openModal=local&propertyId=...&tenantId=...&local=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openModal = params.get('openModal');
    const propertyIdParam = params.get('propertyId');
    if (openModal === 'local' && propertyIdParam) {
      const pid = Number(propertyIdParam);
      if (!isNaN(pid)) {
        setViewMode('grid'); // La vista por local vive en el grid
        setDeepLinkPropertyId(pid);
      }
    } else {
      setDeepLinkPropertyId(undefined);
    }
  }, [location.search]);
  
  // Actualizar cuando el gateway termine de cargar
  useEffect(() => {
    if (dataGateway.isLoaded()) {
      if (tenants.length > 0 && selectedTenantId === null) {
        setSelectedTenantId(tenants[0].id);
      }
      fetchPayments(selectedTenantId);
      setLoading(false);
    }
  }, [dataGateway.isLoaded()]);

  // Refrescar en cambios del DataGateway (reactivo)
  useEffect(() => {
    const unsubscribe = dataGateway.onChange(() => {
      fetchPayments(selectedTenantId);
      setLoading(false);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataGateway, selectedTenantId]);

  // Cargar pagos cuando cambie el inquilino seleccionado
  useEffect(() => {
    if (selectedTenantId !== null && dataGateway.isLoaded()) {
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
    setEditDialogOpen(true);
  };

  const handleEditSuccess = async () => {
    // Invalidar cache y recargar desde el servicio
    dataGateway.invalidate();
    await dataGateway.loadAll();
    fetchPayments(selectedTenantId);
    // Recargar pagos después de editar exitosamente
    await fetchPayments(selectedTenantId);
    setEditDialogOpen(false);
    setEditingPayment(null);
  };

  const handleDelete = (payment: Payment) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;

    try {
      await paymentService.deletePayment(paymentToDelete.id);
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
      // Invalidar cache y recargar desde el servicio
      dataGateway.invalidate();
      await dataGateway.loadAll();
      fetchPayments(selectedTenantId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete payment');
    }
  };



  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Pagos
        </Typography>
        {viewMode === 'table' && (
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
        )}
      </Box>

      {/* Navigation Menu - Siempre visible */}
      <NavigationTabs />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ position: 'relative' }}>
        {viewMode === 'grid' ? (
          <PaymentByPropertyView openPropertyId={deepLinkPropertyId} />
        ) : (
          <>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <PaymentTable
                payments={filteredPayments}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePentamont={handleTogglePentamont}
                onPaymentClick={(payment) => {
                  setSelectedPayment(payment);
                  setDetailsModalOpen(true);
                }}
              />
            )}
          </>
        )}
      </Box>

      {/* Floating Action Button for switching view */}
      <Fab
        color="secondary"
        variant="extended"
        size="large"
        aria-label="switch view"
        sx={{
          position: 'fixed',
          bottom: 100,
          right: 16,
          px: 3,
          py: 1.5
        }}
        onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
      >
        {viewMode === 'grid' ? <TableChartIcon sx={{ mr: 1 }} /> : <ViewModuleIcon sx={{ mr: 1 }} />}
        {viewMode === 'grid' ? 'Ver en Tabla' : 'Ver por Local'}
      </Fab>

      {/* Floating Action Button for creating new payment - OCULTO */}
      {/* <Fab
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
      </Fab> */}

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
              options={dataGateway.getProperties()}
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
              loading={false}
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

      {/* Edit Payment Modal */}
      <EditPaymentModal
        open={editDialogOpen}
        payment={editingPayment}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingPayment(null);
        }}
        onSuccess={handleEditSuccess}
      />

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

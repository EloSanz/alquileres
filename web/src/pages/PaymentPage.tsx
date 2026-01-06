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
import { Delete as DeleteIcon, CloudUpload as CloudUploadIcon, ViewModule as ViewModuleIcon, TableChart as TableChartIcon, Add as AddIcon } from '@mui/icons-material';
import RoleGuard from '../components/RoleGuard';
import NavigationTabs from '../components/NavigationTabs';
import { Property } from '../../../shared/types/Property';
import { usePayments } from '../hooks/usePayments';
import { useProperties } from '../hooks/useProperties';
import { useTenants } from '../hooks/useTenants';
import { Payment, CreatePayment, UpdatePayment } from '../../../shared/types/Payment';
import EditPaymentModal from '../components/EditPaymentModal';
import SearchBar from '../components/SearchBar';
import FilterBar, { FilterConfig } from '../components/FilterBar';
import PaymentDetailsModal from '../components/PaymentDetailsModal';
import PaymentTable from '../components/PaymentTable';
import PaymentByPropertyView from '../components/PaymentByPropertyView';

const PaymentPage = () => {
  const {
    payments,
    isLoading: loading,
    error: queryError,
    createPayment,
    updatePayment,
    deletePayment
  } = usePayments();

  const { properties } = useProperties();
  const { tenants } = useTenants();

  const location = useLocation();


  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);

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
  const [actionError, setActionError] = useState('');

  // Filtering Logic
  const getFilteredPayments = () => {
    let result = payments;

    // Filter by tenant if selected
    if (selectedTenantId !== null) {
      result = result.filter(p => p.tenantId === selectedTenantId);
    }

    return result.filter(payment => {
      // Filtro de búsqueda por texto
      if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
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
      if (filterValues.paymentMethod && payment.paymentMethod !== filterValues.paymentMethod) {
        return false;
      }

      // Filtro por status
      if (filterValues.status && payment.status !== filterValues.status) {
        return false;
      }

      return true;
    });
  };

  const currentFilteredPayments = getFilteredPayments();

  // Handled by generic hooks logic automatically
  // useEffect(() => {
  //   if (!dataGateway.isLoaded() && !dataGateway.isLoading()) {
  //     dataGateway.loadAll();
  //   }
  // }, [dataGateway]);

  // Handle deep linking
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

  // Set initial selected tenant
  useEffect(() => {
    if (tenants.length > 0 && selectedTenantId === null) {
      setSelectedTenantId(tenants[0].id);
    }
  }, [tenants, selectedTenantId]);


  const handleTogglePentamont = async (payment: Payment) => {
    try {
      setActionError('');
      const next = !payment.pentamontSettled;
      const updateData: UpdatePayment = { pentamontSettled: next };
      await updatePayment({ id: payment.id, data: updateData });
    } catch (e: any) {
      setActionError(e?.message || 'No se pudo actualizar Pentamont');
    }
  };

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
    setFilterValues({ paymentMethod: '', status: '' });
  };

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

  const handleCreatePayment = async () => {
    const amountError = validateAmount(createForm.amount);
    if (amountError) {
      setAmountError(amountError);
      return;
    }

    if (!selectedProperty) {
      setActionError('Debe seleccionar una propiedad');
      return;
    }

    try {
      setActionError('');
      const tenantId = selectedProperty.tenantId;
      if (!tenantId) {
        setActionError('La propiedad seleccionada no tiene un inquilino asignado');
        return;
      }

      const paymentData: CreatePayment = {
        tenantId,
        propertyId: selectedProperty.id,
        amount: parseFloat(createForm.amount),
        dueDate: createForm.dueDate,
        paymentDate: createForm.paymentDate,
        paymentMethod: createForm.paymentMethod,
        notes: createForm.notes || undefined
      };
      // (paymentData as any).receiptImage = receiptImageFile || null; // Ignored for now as backend doesn't support it in schema yet directly? Or schema doesn't match?

      await createPayment(paymentData);

      setCreateDialogOpen(false);
      setSelectedProperty(null);
      setAmountError('');
      setReceiptImageFile(null);
      setReceiptImagePreview(null);
      setCreateForm({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentMethod: 'YAPE',
        notes: '',
      });
    } catch (err: any) {
      setActionError(err.message || 'Failed to create payment');
    }
  };


  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = async () => {
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
      setActionError('');
      await deletePayment(paymentToDelete.id);
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete payment');
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

      {displayError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setActionError('')}>
          {displayError}
        </Alert>
      )}

      <Box sx={{ position: 'relative' }}>
        {viewMode === 'grid' ? (
          <PaymentByPropertyView openPropertyId={deepLinkPropertyId} />
        ) : (
          <PaymentTable
            payments={currentFilteredPayments}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTogglePentamont={handleTogglePentamont}
            onPaymentClick={(payment) => {
              setSelectedPayment(payment);
              setDetailsModalOpen(true);
            }}
          />
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
              options={properties || []}
              getOptionLabel={(property) =>
                `Local N° ${property.localNumber} - ${property.ubicacion === 'BOULEVAR' ? 'Boulevard' : property.ubicacion === 'SAN_MARTIN' ? 'San Martin' : property.ubicacion}, ${property.tenant?.firstName || ''} ${property.tenant?.lastName || ''} (${property.monthlyRent} S/)`
              }
              value={selectedProperty}
              onChange={(_, newValue) => {
                setSelectedProperty(newValue);
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

      {/* Create Payment FAB accessible only to ADMIN */}
      <RoleGuard allowedRoles={['ADMIN']}>
        <Fab
          color="primary"
          variant="extended"
          size="large"
          aria-label="agregar pago"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 16,
            px: 3,
            py: 1.5,
            zIndex: 1000
          }}
          onClick={() => setCreateDialogOpen(true)}
        >
          <AddIcon sx={{ mr: 1 }} />
          Agregar Pago
        </Fab>
      </RoleGuard>

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
    </Container >
  );
};

export default PaymentPage;

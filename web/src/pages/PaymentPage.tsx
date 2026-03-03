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
} from '@mui/material';
import { ViewModule as ViewModuleIcon, TableChart as TableChartIcon, Add as AddIcon, Store as StoreIcon, Business as BusinessIcon } from '@mui/icons-material';
import PatioPaymentView from '../components/PatioPaymentView';
import RoleGuard from '../components/RoleGuard';
import NavigationTabs from '../components/NavigationTabs';
import { usePayments } from '../hooks/usePayments';
import { useTenants } from '../hooks/useTenants';
import { useContracts } from '../hooks/useContracts';
import { Payment, UpdatePayment } from '../../../shared/types/Payment';
import EditPaymentModal from '../components/EditPaymentModal';
import SearchBar from '../components/SearchBar';
import FilterBar, { FilterConfig } from '../components/FilterBar';
import PaymentDetailsModal from '../components/PaymentDetailsModal';
import PaymentTable from '../components/PaymentTable';
import PaymentByPropertyView from '../components/PaymentByPropertyView';
import { formatDateUTC } from '../utils/dateUtils';

const PaymentPage = () => {
  const {
    payments,
    isLoading: loading,
    error: queryError,
    updatePayment,
    deletePayment,
  } = usePayments();

  const { tenants } = useTenants();
  useContracts(); // Call it if we need it for some reason, or just remove if we don't

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
  const [createForm] = useState({
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [deepLinkPropertyId, setDeepLinkPropertyId] = useState<number | undefined>(undefined);
  const [showPatio, setShowPatio] = useState(false);
  const [actionError, setActionError] = useState('');

  // Filtering Logic
  const getFilteredPayments = () => {
    let result = payments;

    // Filter by tenant if selected
    if (selectedTenantId !== null) {
      result = result.filter((p: Payment) => p.tenantId === selectedTenantId);
    }

    return result.filter((payment: Payment) => {
      // Filtro de búsqueda por texto
      if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
        const matchesQuery =
          payment.amount.toString().includes(lowerQuery) ||
          payment.tenantFullName?.toLowerCase().includes(lowerQuery) ||
          payment.paymentMethod?.toLowerCase().includes(lowerQuery) ||
          payment.notes?.toLowerCase().includes(lowerQuery) ||
          formatDateUTC(payment.paymentDate).toLowerCase().includes(lowerQuery) ||
          formatDateUTC(payment.dueDate).toLowerCase().includes(lowerQuery);

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
        {showPatio ? (
          <PatioPaymentView />
        ) : viewMode === 'grid' ? (
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

      {/* Floating Action Button: toggle Patio */}
      <Fab
        variant="extended"
        size="large"
        aria-label="toggle patio view"
        sx={{
          position: 'fixed',
          bottom: 168,
          right: 16,
          px: 3,
          py: 1.5,
          bgcolor: showPatio ? 'warning.main' : 'secondary.dark',
          color: 'white',
          '&:hover': { bgcolor: showPatio ? 'warning.dark' : 'secondary.main' },
          zIndex: 1000,
        }}
        onClick={() => setShowPatio(prev => !prev)}
      >
        {showPatio ? <BusinessIcon sx={{ mr: 1 }} /> : <StoreIcon sx={{ mr: 1 }} />}
        {showPatio ? 'Boulevard y San Martín' : 'Ver Patio'}
      </Fab>

      {/* Floating Action Button for switching view (hidden in patio mode) */}
      {!showPatio && (
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
      )}

      {/* Unified Create/Edit Payment Modal */}
      <EditPaymentModal
        open={createDialogOpen || editDialogOpen}
        payment={editingPayment}
        initialData={createDialogOpen ? {
          paymentDate: createForm.paymentDate,
          dueDate: createForm.dueDate,
          paymentMethod: createForm.paymentMethod as any,
          notes: createForm.notes,
        } : undefined}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditDialogOpen(false);
          setEditingPayment(null);
        }}
        onSuccess={handleEditSuccess}
      />

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

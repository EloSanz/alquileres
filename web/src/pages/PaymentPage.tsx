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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Visibility as VisibilityIcon, Delete as DeleteIcon } from '@mui/icons-material';
import NavigationTabs from '../components/NavigationTabs';

interface Payment {
  id: number;
  rentalId: number;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: string;
  createdAt: string;
}

interface CreatePaymentData {
  rentalId: number;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    rentalId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días por defecto
    paymentType: 'RENT',
    status: 'PENDING',
    notes: '',
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editForm, setEditForm] = useState({
    rentalId: '',
    amount: '',
    paymentDate: '',
    dueDate: '',
    paymentType: 'RENT',
    status: 'PENDING',
    notes: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(''); // Limpiar error anterior
      const data = await paymentService.getAllPayments();
      setPayments(data);
    } catch (err: any) {
      // Solo mostrar error si es un error real de red/API, no si es array vacío
      if (err.message && !err.message.includes('fetch')) {
        setError(err.message);
      }
      // Si es array vacío, no es error - simplemente no hay datos
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    try {
      const paymentData: CreatePaymentData = {
        rentalId: parseInt(createForm.rentalId),
        amount: parseFloat(createForm.amount),
        paymentDate: createForm.paymentDate,
        dueDate: createForm.dueDate,
        paymentType: createForm.paymentType,
        status: createForm.status,
        notes: createForm.notes || undefined,
      };

      await paymentService.createPayment(paymentData);

      setCreateDialogOpen(false);
      setCreateForm({
        rentalId: '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días por defecto
        paymentType: 'RENT',
        status: 'PENDING',
        notes: '',
      });
      fetchPayments(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to create payment');
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleViewDetails = (payment: Payment) => {
    // TODO: Navigate to payment details page
    console.log('View details for payment:', payment.id);
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setEditForm({
      rentalId: payment.rentalId.toString(),
      amount: payment.amount.toString(),
      paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
      dueDate: new Date(payment.dueDate).toISOString().split('T')[0],
      paymentType: 'RENT', // Default, should come from payment if available
      status: payment.status,
      notes: '', // Should come from payment if available
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
        rentalId: parseInt(editForm.rentalId),
        amount: parseFloat(editForm.amount),
        paymentDate: editForm.paymentDate,
        dueDate: editForm.dueDate,
        paymentType: editForm.paymentType,
        status: editForm.status,
        notes: editForm.notes || undefined,
      };

      await paymentService.updatePayment(editingPayment.id, paymentData);

      setEditDialogOpen(false);
      setEditingPayment(null);
      setEditForm({
        rentalId: '',
        amount: '',
        paymentDate: '',
        dueDate: '',
        paymentType: 'RENT',
        status: 'PENDING',
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
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pagos
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
                <TableCell><strong>ID Alquiler</strong></TableCell>
                <TableCell><strong>Monto</strong></TableCell>
                <TableCell><strong>Fecha Pago</strong></TableCell>
                <TableCell><strong>Fecha Vencimiento</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} hover>
                  <TableCell>#{payment.rentalId}</TableCell>
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
            <TextField
              fullWidth
              label="ID del Alquiler"
              type="number"
              value={createForm.rentalId}
              onChange={(e) => setCreateForm({ ...createForm, rentalId: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Monto (S/)"
              type="number"
              value={createForm.amount}
              onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
              required
              sx={{ mb: 2 }}
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
              <MenuItem value="PENDING">Pendiente</MenuItem>
              <MenuItem value="COMPLETED">Completado</MenuItem>
              <MenuItem value="OVERDUE">Vencido</MenuItem>
              <MenuItem value="CANCELLED">Cancelado</MenuItem>
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
          <Button onClick={handleCreatePayment} variant="contained">
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
              label="ID del Alquiler"
              type="number"
              value={editForm.rentalId}
              onChange={(e) => setEditForm({ ...editForm, rentalId: e.target.value })}
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
              <MenuItem value="PENDING">Pendiente</MenuItem>
              <MenuItem value="COMPLETED">Completado</MenuItem>
              <MenuItem value="OVERDUE">Vencido</MenuItem>
              <MenuItem value="CANCELLED">Cancelado</MenuItem>
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

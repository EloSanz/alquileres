import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Fab,
  Alert,
  CircularProgress,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Card,
  CardContent,
  Grid,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Payment as PaymentIcon,
  Business as BusinessIcon,
  Refresh as RefreshIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface Tenant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  documentId: string;
  createdAt: string;
}

interface Property {
  id: number;
  name: string;
  address: string;
  city: string;
  propertyType: string;
  monthlyRent: number;
  isAvailable: boolean;
  createdAt: string;
}

interface Payment {
  id: number;
  rentalId: number;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: string;
  createdAt: string;
}

const HomePage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Estado para las diferentes secciones
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState({
    tenants: true,
    properties: true,
    payments: true,
  });
  const [error, setError] = useState('');

  // Estado para el menú principal
  const [activeSection, setActiveSection] = useState<'tenants' | 'properties' | 'payments'>('tenants');

  // Cargar datos iniciales
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading({ tenants: false, properties: false, payments: false });
    setError('');

    // Por ahora mostramos datos de ejemplo hasta que se implementen las rutas
    setTenants([
      {
        id: 1,
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        phone: '+1234567890',
        documentId: '12345678A',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        firstName: 'María',
        lastName: 'García',
        email: 'maria@example.com',
        phone: '+0987654321',
        documentId: '87654321B',
        createdAt: new Date().toISOString()
      }
    ]);

    setProperties([
      {
        id: 1,
        name: 'Apartamento Centro',
        address: 'Calle Mayor 123',
        city: 'Madrid',
        propertyType: 'APARTMENT',
        monthlyRent: 1200,
        isAvailable: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Casa Familiar',
        address: 'Avenida Principal 456',
        city: 'Barcelona',
        propertyType: 'HOUSE',
        monthlyRent: 1800,
        isAvailable: false,
        createdAt: new Date().toISOString()
      }
    ]);

    setPayments([
      {
        id: 1,
        rentalId: 1,
        amount: 1200,
        paymentDate: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        rentalId: 2,
        amount: 1800,
        paymentDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }
    ]);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
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

  const renderTenants = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Inquilinos ({tenants.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tenants/new')}
        >
          Nuevo Inquilino
        </Button>
      </Box>

      {loading.tenants ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : tenants.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay inquilinos registrados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crea tu primer inquilino para comenzar
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>DNI</TableCell>
                <TableCell>Fecha Registro</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.slice(0, 10).map((tenant) => (
                <TableRow key={tenant.id} hover>
                  <TableCell>
                    {tenant.firstName} {tenant.lastName}
                  </TableCell>
                  <TableCell>{tenant.email}</TableCell>
                  <TableCell>{tenant.phone || '-'}</TableCell>
                  <TableCell>{tenant.documentId}</TableCell>
                  <TableCell>{formatDate(tenant.createdAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/tenants/${tenant.id}`)}
                    >
                      <BusinessIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  const renderProperties = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          <HomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Propiedades ({properties.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/properties/new')}
        >
          Nueva Propiedad
        </Button>
      </Box>

      {loading.properties ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : properties.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay propiedades registradas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Agrega tu primera propiedad al sistema
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {properties.slice(0, 6).map((property) => (
            <Grid item xs={12} md={6} lg={4} key={property.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {property.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {property.address}, {property.city}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">
                      Tipo: {property.propertyType}
                    </Typography>
                    <Chip
                      label={property.isAvailable ? 'Disponible' : 'Ocupada'}
                      color={property.isAvailable ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(property.monthlyRent)}/mes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderPayments = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Pagos Recientes ({payments.length})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadAllData}
        >
          Actualizar
        </Button>
      </Box>

      {loading.payments ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : payments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay pagos registrados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Los pagos aparecerán aquí cuando se registren
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Alquiler</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Fecha Pago</TableCell>
                <TableCell>Fecha Vencimiento</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.slice(0, 10).map((payment) => (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ pt: 2, pb: 10 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'grey.800',
          pb: 2
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Panel de Administración
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bienvenido, {user?.username}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Cerrar Sesión
        </Button>
      </Box>

      {/* Navigation Menu */}
      <Box mb={4}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant={activeSection === 'tenants' ? 'contained' : 'outlined'}
              startIcon={<PeopleIcon />}
              onClick={() => setActiveSection('tenants')}
              sx={{ py: 2 }}
            >
              Inquilinos
              <Chip
                label={tenants.length}
                size="small"
                sx={{ ml: 1 }}
                color={activeSection === 'tenants' ? 'default' : 'primary'}
              />
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/property')}
              sx={{ py: 2 }}
            >
              Propiedades
              <Chip
                label={properties.length}
                size="small"
                sx={{ ml: 1 }}
                color="primary"
              />
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant={activeSection === 'payments' ? 'contained' : 'outlined'}
              startIcon={<PaymentIcon />}
              onClick={() => setActiveSection('payments')}
              sx={{ py: 2 }}
            >
              Pagos
              <Chip
                label={payments.length}
                size="small"
                sx={{ ml: 1 }}
                color={activeSection === 'payments' ? 'default' : 'primary'}
              />
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Content */}
      {activeSection === 'tenants' && renderTenants()}
      {activeSection === 'properties' && renderProperties()}
      {activeSection === 'payments' && renderPayments()}

      {/* Floating Action Button */}
      <Tooltip title="Actualizar datos" placement="left">
        <Fab
          color="primary"
          aria-label="refresh"
          onClick={loadAllData}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <RefreshIcon />
        </Fab>
      </Tooltip>
    </Container>
  );
};

export default HomePage;

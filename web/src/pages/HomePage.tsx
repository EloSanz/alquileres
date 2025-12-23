import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  Home as HomeIcon,
  Payment as PaymentIcon,
  Business as BusinessIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import NavigationTabs from '../components/NavigationTabs';

const HomePage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión de Alquileres
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

      {/* Navigation Menu - Siempre visible */}
      <NavigationTabs />

      {/* Dashboard Cards */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 3 }}>
        Panel de Control
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
            onClick={() => navigate('/tenants')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <PeopleIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Inquilinos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestiona los inquilinos del sistema
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
            onClick={() => navigate('/property')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <HomeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Propiedades
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Administra las propiedades disponibles
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
            onClick={() => navigate('/payments')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <PaymentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Pagos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Controla los pagos y facturación
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          Acciones Rápidas
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PeopleIcon />}
              onClick={() => navigate('/tenants')}
              sx={{ py: 2 }}
            >
              Nuevo Inquilino
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/property')}
              sx={{ py: 2 }}
            >
              Nueva Propiedad
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PaymentIcon />}
              onClick={() => navigate('/payments')}
              sx={{ py: 2 }}
            >
              Nuevo Pago
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<BusinessIcon />}
              onClick={() => navigate('/property')}
              sx={{ py: 2 }}
            >
              Ver Contratos
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage;

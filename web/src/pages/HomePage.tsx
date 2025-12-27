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
  Description as ContractIcon,
  Build as ServiceIcon,
  AccountBalance as TaxIcon,
  Security as GuaranteeIcon,
  BuildCircle as MaintenanceIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      {/* Header */}
      <Box
        sx={{
          display: { xs: 'block', sm: 'flex' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 4,
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Penta Mont
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bienvenido, {user?.username}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          fullWidth={false}
          sx={{ 
            width: { xs: '100%', sm: 'auto' },
            mt: { xs: 2, sm: 0 }
          }}
        >
          Cerrar Sesión
        </Button>
      </Box>

      {/* Dashboard Cards */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 3 }}>
        Panel de Control
      </Typography>

      <Grid container spacing={3}>
        {/* Primera fila: 3 columnas */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 200,
              '&:hover': { transform: 'translateY(-4px)' }
            }}
            onClick={() => navigate('/tenants')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h6">
                  Inquilinos
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Gestiona los inquilinos del sistema
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 200,
              '&:hover': { transform: 'translateY(-4px)' }
            }}
            onClick={() => navigate('/property')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
                <HomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h6">
                  Locales
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Administra las propiedades disponibles
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 200,
              '&:hover': { transform: 'translateY(-4px)' }
            }}
            onClick={() => navigate('/payments')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
                <PaymentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h6">
                  Pagos
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Controla los pagos y facturación
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Segunda fila: 3 columnas */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 200,
              '&:hover': { transform: 'translateY(-4px)' }
            }}
            onClick={() => navigate('/contracts')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
                <ContractIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h6">
                  Contratos
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Gestiona los contratos de alquiler
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 200,
              '&:hover': { transform: 'translateY(-4px)' }
            }}
            onClick={() => navigate('/services')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
                <ServiceIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h6">
                  Servicios
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Gestiona servicios (Agua, Luz, Arbitrios)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 200,
              '&:hover': { transform: 'translateY(-4px)' }
            }}
            onClick={() => navigate('/taxes')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
                <TaxIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h6">
                  Impuestos
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Gestiona impuestos municipales y prediales
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Tercera fila: 2 columnas */}
        <Grid item xs={12} sm={6} md={6}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 200,
              '&:hover': { transform: 'translateY(-4px)' }
            }}
            onClick={() => navigate('/guarantees')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
                <GuaranteeIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h6">
                  Garantías
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Gestiona depósitos y garantías de alquiler
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 200,
              '&:hover': { transform: 'translateY(-4px)' }
            }}
            onClick={() => navigate('/maintenances')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
                <MaintenanceIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h6">
                  Mantenimiento
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Gestiona trabajos de mantenimiento y reparaciones
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;

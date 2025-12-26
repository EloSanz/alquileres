import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
} from '@mui/material';
import {
  People as PeopleIcon,
  Home as HomeIcon,
  Payment as PaymentIcon,
  Description as ContractIcon,
  Build as ServiceIcon,
} from '@mui/icons-material';

const NavigationTabs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determinar qué sección está activa basado en la ruta actual
  const getActiveSection = () => {
    if (location.pathname === '/tenants') return 'tenants';
    if (location.pathname === '/property') return 'properties';
    if (location.pathname === '/payments') return 'payments';
    if (location.pathname === '/contracts') return 'contracts';
    if (location.pathname === '/services') return 'services';
    if (location.pathname === '/' || location.pathname.startsWith('/#')) return 'home';
    return 'home'; // Default
  };

  const activeSection = getActiveSection();

  // Función genérica para manejar navegación
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <Box mb={4}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={2.4}>
          <Button
            fullWidth
            variant={activeSection === 'tenants' ? 'contained' : 'outlined'}
            startIcon={<PeopleIcon />}
            onClick={() => handleNavigate('/tenants')}
            sx={{ py: 2 }}
          >
            Inquilinos
          </Button>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Button
            fullWidth
            variant={activeSection === 'properties' ? 'contained' : 'outlined'}
            startIcon={<HomeIcon />}
            onClick={() => handleNavigate('/property')}
            sx={{ py: 2 }}
          >
            Locales
          </Button>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Button
            fullWidth
            variant={activeSection === 'payments' ? 'contained' : 'outlined'}
            startIcon={<PaymentIcon />}
            onClick={() => handleNavigate('/payments')}
            sx={{ py: 2 }}
          >
            Pagos
          </Button>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Button
            fullWidth
            variant={activeSection === 'contracts' ? 'contained' : 'outlined'}
            startIcon={<ContractIcon />}
            onClick={() => handleNavigate('/contracts')}
            sx={{ py: 2 }}
          >
            Contratos
          </Button>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Button
            fullWidth
            variant={activeSection === 'services' ? 'contained' : 'outlined'}
            startIcon={<ServiceIcon />}
            onClick={() => handleNavigate('/services')}
            sx={{ py: 2 }}
          >
            Servicios
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NavigationTabs;

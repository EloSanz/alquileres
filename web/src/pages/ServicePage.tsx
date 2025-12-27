import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import NavigationTabs from '../components/NavigationTabs';
import { useServiceService } from '../services/serviceService';

const ServicePage = () => {
  const serviceService = useServiceService();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasFetchedRef = useRef(false);
  
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError('');
        await serviceService.getAllServices();
      } catch (err: any) {
        setError(err.message || 'Error al cargar servicios');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Servicios
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de servicios (Agua, Luz, Arbitrios) - En desarrollo
        </Typography>
      </Box>

      {/* Navigation Menu */}
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
        <Paper sx={{ p: 4, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Módulo de Servicios
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Este módulo está en desarrollo. Aquí se gestionarán los servicios de:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Agua:</strong> Registro y seguimiento de pagos de agua y desagüe
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Luz:</strong> Registro y seguimiento de pagos de energía eléctrica
            </Typography>
            <Typography component="li" variant="body2">
              <strong>Arbitrios:</strong> Registro y seguimiento de pagos de arbitrios municipales
            </Typography>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default ServicePage;


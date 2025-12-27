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
import { useMaintenanceService } from '../services/maintenanceService';

const MaintenancePage = () => {
  const maintenanceService = useMaintenanceService();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasFetchedRef = useRef(false);
  
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    
    const fetchMaintenances = async () => {
      try {
        setLoading(true);
        setError('');
        await maintenanceService.getAllMaintenances();
      } catch (err: any) {
        setError(err.message || 'Error al cargar mantenimientos');
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenances();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mantenimiento
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de trabajos de mantenimiento y reparaciones
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
            Módulo de Mantenimiento
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Gestión completa de trabajos de mantenimiento:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Reparaciones:</strong> Registro y seguimiento de reparaciones
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Limpieza:</strong> Registro de trabajos de limpieza y mantenimiento
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Pintura:</strong> Registro y seguimiento de trabajos de pintura
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Electricidad:</strong> Registro de trabajos eléctricos
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Plomería:</strong> Registro de trabajos de plomería
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Jardinería:</strong> Registro de trabajos de jardinería
            </Typography>
            <Typography component="li" variant="body2">
              <strong>Otros:</strong> Otros tipos de mantenimiento
            </Typography>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default MaintenancePage;

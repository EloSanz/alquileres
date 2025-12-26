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
import { useGuaranteeService } from '../services/guaranteeService';

const GuaranteePage = () => {
  const guaranteeService = useGuaranteeService();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    
    const fetchGuarantees = async () => {
      try {
        setLoading(true);
        setError('');
        await guaranteeService.getAllGuarantees();
      } catch (err: any) {
        setError(err.message || 'Error al cargar garantías');
      } finally {
        setLoading(false);
      }
    };

    fetchGuarantees();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Garantías
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de depósitos y garantías de alquileres
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
            Módulo de Garantías
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Gestión completa de garantías y depósitos:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Depósitos:</strong> Registro y seguimiento de depósitos de garantía
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Fianzas:</strong> Registro y seguimiento de fianzas bancarias
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Seguros:</strong> Registro y seguimiento de seguros de alquiler
            </Typography>
            <Typography component="li" variant="body2">
              <strong>Otros:</strong> Otros tipos de garantías
            </Typography>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default GuaranteePage;

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
import { useTaxService } from '../services/taxService';

const TaxPage = () => {
  const taxService = useTaxService();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasFetchedRef = useRef(false);
  
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    
    const fetchTaxes = async () => {
      try {
        setLoading(true);
        setError('');
        await taxService.getAllTaxes();
      } catch (err: any) {
        setError(err.message || 'Error al cargar impuestos');
      } finally {
        setLoading(false);
      }
    };

    fetchTaxes();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Impuestos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de impuestos municipales y prediales
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
            Módulo de Impuestos
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Gestión completa de impuestos para propiedades:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Predial:</strong> Registro y seguimiento de pagos de impuesto predial
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Municipal:</strong> Registro y seguimiento de arbitrios municipales
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Alcabalas:</strong> Registro y seguimiento de alcabalas
            </Typography>
            <Typography component="li" variant="body2">
              <strong>Otros:</strong> Otros tipos de impuestos municipales
            </Typography>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default TaxPage;

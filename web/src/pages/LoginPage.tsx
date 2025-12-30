import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();
  // const api = useApi(); // No usado actualmente, usando fetch directo

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Usar fetch directamente con la ruta correcta /pentamont/api/auth/login
      const response = await fetch(`${window.location.origin}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: formData.identifier,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al iniciar sesión' }));
        setError(errorData.message || `Error ${response.status}`);
        return;
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Asegurar que el token esté limpio (sin espacios ni comillas)
        const token = String(data.data.token || '').trim().replace(/^["']|["']$/g, '');
        const user = data.data.user;

        if (!token) {
          setError('Token no recibido del servidor');
          return;
        }

        // Validar formato JWT (debe tener 3 partes separadas por puntos)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          console.error('Token malformado recibido:', {
            length: token.length,
            parts: tokenParts.length,
            preview: token.substring(0, 20) + '...'
          });
          setError('Token inválido recibido del servidor');
          return;
        }

        login(token, user);
        navigate('/');
      } else {
        setError(data.message || 'Error al iniciar sesión');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: { xs: 2, sm: 0 } }}>
      <Paper elevation={8} sx={{ p: { xs: 2, sm: 4 }, width: '100%', borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Gestión de Alquileres
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Inicia sesión en tu cuenta de administrador
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            fullWidth
            label="Usuario o correo electrónico"
            name="identifier"
            type="text"
            value={formData.identifier}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            autoComplete="username email"
          />

          <TextField
            fullWidth
            label="Contraseña"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
            sx={{ mb: 2, py: 1.5 }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            ¿No tienes cuenta?{' '}
            <Link to="/register" style={{ color: 'primary.main', textDecoration: 'none' }}>
              Regístrate aquí
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;

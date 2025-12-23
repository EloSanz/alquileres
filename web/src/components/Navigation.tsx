import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Home as HomeIcon, Brightness4 as ThemeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAppTheme } from '../contexts/ThemeContext';

const Navigation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { themeName, setTheme } = useAppTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'github', 'kyoto', 'tokyo'];
    const currentIndex = themes.indexOf(themeName);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  if (!isAuthenticated) return null;

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Gestión de Alquileres
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            color="inherit"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
          >
            Inicio
          </Button>

          <Button
            color="inherit"
            startIcon={<ThemeIcon />}
            onClick={toggleTheme}
          >
            {themeName}
          </Button>

          <Button
            color="inherit"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;

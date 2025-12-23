import { Container, Typography, Box } from '@mui/material'

function App() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sistema de Gestión de Alquileres
        </Typography>
        <Typography variant="body1">
          Aplicación para administradores de propiedades.
        </Typography>
      </Box>
    </Container>
  )
}

export default App

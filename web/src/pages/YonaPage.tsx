import { useState } from 'react';
import { Box, Button, Typography, Container, Paper } from '@mui/material';
import YonaContractEditor from '../components/yona/YonaContractEditor';

export default function YonaPage() {
    const [openEditor, setOpenEditor] = useState(false);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Yona - Contratos
                </Typography>

                <Typography variant="body1" color="text.secondary" align="center">
                    Página dedicada a la gestión de contratos Yona.
                    Aquí puedes crear y modificar plantillas de contratos.
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => setOpenEditor(true)}
                        sx={{ minWidth: 200 }}
                    >
                        Crear Nuevo Contrato
                    </Button>
                </Box>

                <YonaContractEditor
                    open={openEditor}
                    onClose={() => setOpenEditor(false)}
                />
            </Paper>
        </Container>
    );
}

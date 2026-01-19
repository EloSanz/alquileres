import { useState } from 'react';
import { Box, Button, Typography, Container, Paper } from '@mui/material';
import YonaContractEditor from '../components/yona/YonaContractEditor';
import YonaHandoverEditor from '../components/yona/YonaHandoverEditor';

export default function YonaPage() {
    const [openEditor, setOpenEditor] = useState(false);
    const [openHandoverEditor, setOpenHandoverEditor] = useState(false);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Yona - Contratos
                </Typography>

                <Typography variant="body1" color="text.secondary" align="center">
                    Página dedicada a la gestión de contratos Yona.
                    Aquí puedes crear y modificar plantillas de contratos y actas de entrega.
                </Typography>

                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => setOpenEditor(true)}
                        sx={{ minWidth: 200 }}
                    >
                        Crear Nuevo Contrato
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => setOpenHandoverEditor(true)}
                        sx={{ minWidth: 200 }}
                    >
                        Generar Acta de Entrega
                    </Button>
                </Box>

                <YonaContractEditor
                    open={openEditor}
                    onClose={() => setOpenEditor(false)}
                />

                <YonaHandoverEditor
                    open={openHandoverEditor}
                    onClose={() => setOpenHandoverEditor(false)}
                />
            </Paper>
        </Container>
    );
}

import React from 'react';
import {
    TextField,
    Grid,
    Stack,
    Typography,
    Paper
} from '@mui/material';
import type { YonaHandoverData } from '../../services/yonaContractService';

interface YonaHandoverFormSectionProps {
    data: YonaHandoverData;
    onChange: (field: keyof YonaHandoverData, value: string) => void;
}

export default function YonaHandoverFormSection({ data, onChange }: YonaHandoverFormSectionProps) {
    const handleChange = (field: keyof YonaHandoverData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(field, e.target.value);
    };

    return (
        <Stack spacing={3}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" gutterBottom color="primary">Datos del Inmueble</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label="Número de Estacionamiento"
                            fullWidth
                            value={data.estacionamiento_numero}
                            onChange={handleChange('estacionamiento_numero')}
                            placeholder="Ej: doble N° 3 - 4"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Dirección del Edificio"
                            fullWidth
                            multiline
                            rows={2}
                            value={data.edificio_direccion}
                            onChange={handleChange('edificio_direccion')}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Nombre Inmobiliaria (Vendedora)"
                            fullWidth
                            value={data.inmobiliaria_nombre}
                            onChange={handleChange('inmobiliaria_nombre')}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" gutterBottom color="primary">Datos del Receptor y Comprador</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                        <TextField
                            label="Nombre Receptor (Quien recibe)"
                            fullWidth
                            value={data.entrega_receptor_nombre}
                            onChange={handleChange('entrega_receptor_nombre')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="DNI Receptor"
                            fullWidth
                            value={data.entrega_receptor_dni}
                            onChange={handleChange('entrega_receptor_dni')}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Partida Registral (Poder)"
                            fullWidth
                            value={data.entrega_receptor_partida}
                            onChange={handleChange('entrega_receptor_partida')}
                            helperText="Número de partida donde está inscrito el poder"
                        />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                        <TextField
                            label="Nombre Compradora (Representada)"
                            fullWidth
                            value={data.compradora_nombre}
                            onChange={handleChange('compradora_nombre')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="DNI Compradora"
                            fullWidth
                            value={data.compradora_dni}
                            onChange={handleChange('compradora_dni')}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" gutterBottom color="primary">Detalles de la Entrega</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label="Items a Entregar"
                            fullWidth
                            multiline
                            rows={4}
                            value={data.items_entrega}
                            onChange={handleChange('items_entrega')}
                            helperText="Use guiones (-) para listar items, e.g. '- 1 control remoto'"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Lugar y Fecha"
                            fullWidth
                            value={data.lugar_fecha_entrega}
                            onChange={handleChange('lugar_fecha_entrega')}
                        />
                    </Grid>
                </Grid>
            </Paper>
        </Stack>
    );
}

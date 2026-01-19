import React, { memo } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    TextField,
    Grid,
    Typography,
} from '@mui/material';
import {
    Person as PersonIcon,
    CalendarMonth as CalendarIcon,
    AttachMoney as MoneyIcon,
    Assignment as AssignmentIcon,
    Gavel as GavelIcon,
} from '@mui/icons-material';
import type { YonaContractData } from '../../services/yonaContractService';

interface YonaContractFormSectionProps {
    data: YonaContractData;
    stacked?: boolean;
    fieldErrors?: Record<string, string>;
    onChange: (field: keyof YonaContractData, value: string) => void;
}

interface FormFieldProps {
    label: string;
    field: keyof YonaContractData;
    data: YonaContractData;
    error?: string;
    placeholder?: string;
    onChange: (field: keyof YonaContractData, value: string) => void;
    multiline?: boolean;
    rows?: number;
    type?: string;
    xs?: number;
    md?: number;
    stacked?: boolean;
}

const FormField = memo(({ label, field, data, error, placeholder, onChange, multiline, rows, type = 'text', xs = 12, md = 6, stacked }: FormFieldProps) => {
    const colMd = stacked ? 12 : md;
    return (
        <Grid item xs={xs} md={colMd}>
            <TextField
                fullWidth
                label={label}
                placeholder={placeholder}
                value={data[field]}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(field, e.target.value)}
                size="small"
                multiline={multiline}
                rows={rows}
                type={type}
                error={!!error}
                helperText={error}
                InputLabelProps={type === 'date' ? { shrink: true } : undefined}
            />
        </Grid>
    )
});

interface SectionCardProps {
    title: string;
    icon: React.ReactNode;
    color: string;
    children: React.ReactNode;
}

const SectionCard = ({ title, icon, color, children }: SectionCardProps) => (
    <Card sx={{ mb: 3 }}>
        <CardHeader
            avatar={
                <Box sx={{ color, display: 'flex', alignItems: 'center' }}>
                    {icon}
                </Box>
            }
            title={<Typography variant="h6" sx={{ color }}>{title}</Typography>}
            sx={{ pb: 0 }}
        />
        <CardContent>
            <Grid container spacing={2}>
                {children}
            </Grid>
        </CardContent>
    </Card>
);

function YonaContractFormSection({ data, stacked, fieldErrors = {}, onChange }: YonaContractFormSectionProps) {
    return (
        <Box>
            {/* 2. ARRENDATARIO */}
            <SectionCard title="ARRENDATARIO" icon={<PersonIcon />} color="success.main">
                <FormField stacked={stacked} label="Nombre Completo" field="arrendatario_nombre" data={data} error={fieldErrors.arrendatario_nombre} onChange={onChange} md={8} />
                <FormField stacked={stacked} label="DNI / RUC" field="arrendatario_dni" data={data} error={fieldErrors.arrendatario_dni} onChange={onChange} md={4} />
                <FormField stacked={stacked} label="Domicilio Completo" field="arrendatario_domicilio" data={data} error={fieldErrors.arrendatario_domicilio} onChange={onChange} md={12} multiline rows={2} placeholder="Incluir distrito, provincia y departamento" />


            </SectionCard>

            {/* 5. OBJETO DEL CONTRATO */}
            <SectionCard title="OBJETO DEL CONTRATO (Cláusula Primera)" icon={<AssignmentIcon />} color="info.main">
                <FormField stacked={stacked} label="Número de Estacionamiento" field="stand_numero" data={data} error={fieldErrors.stand_numero} onChange={onChange} />

            </SectionCard>

            {/* VEHÍCULO (DESTINO) */}
            <SectionCard title="VEHÍCULO (Cláusula Segunda - Destino)" icon={<CalendarIcon />} color="warning.main">
                <FormField stacked={stacked} label="Placa" field="vehiculo_placa" data={data} error={fieldErrors.vehiculo_placa} onChange={onChange} md={4} />
                <FormField stacked={stacked} label="Marca" field="vehiculo_marca" data={data} error={fieldErrors.vehiculo_marca} onChange={onChange} md={4} />
                <FormField stacked={stacked} label="Modelo" field="vehiculo_modelo" data={data} error={fieldErrors.vehiculo_modelo} onChange={onChange} md={4} />
            </SectionCard>

            {/* 6. PLAZO DEL CONTRATO */}
            <SectionCard title="PLAZO DEL CONTRATO (Cláusula Tercera)" icon={<CalendarIcon />} color="info.main">
                <FormField stacked={stacked} label="Fecha de Inicio" field="fecha_inicio" data={data} error={fieldErrors.fecha_inicio} onChange={onChange} type="date" />
                <FormField stacked={stacked} label="Fecha de Fin" field="fecha_fin" data={data} error={fieldErrors.fecha_fin} onChange={onChange} type="date" />
                <FormField stacked={stacked} label="Plazo (meses)" field="plazo_meses" data={data} error={fieldErrors.plazo_meses} onChange={onChange} />
            </SectionCard>

            {/* 7. LA RENTA */}
            <SectionCard title="RENTA (Cláusula Cuarta)" icon={<MoneyIcon />} color="error.main">
                <FormField stacked={stacked} label="Renta Mensual (S/)" field="renta_mensual" data={data} error={fieldErrors.renta_mensual} onChange={onChange} />
                <FormField stacked={stacked} label="Renta en texto" field="renta_texto" data={data} error={fieldErrors.renta_texto} onChange={onChange} />
                <FormField stacked={stacked} label="Días para pagar (primeros X días)" field="dia_vencimiento" data={data} error={fieldErrors.dia_vencimiento} onChange={onChange} placeholder="Ej: 5" />
                <FormField stacked={stacked} label="Método de Pago" field="metodo_pago" data={data} error={fieldErrors.metodo_pago} onChange={onChange} placeholder="Ej: efectivo / transferencia / Yape" />
            </SectionCard>

            {/* 8. GARANTÍA */}
            <SectionCard title="GARANTÍA (Cláusula Quinta)" icon={<MoneyIcon />} color="error.main">
                <FormField stacked={stacked} label="Monto Garantía (S/)" field="garantia_monto" data={data} error={fieldErrors.garantia_monto} onChange={onChange} />
            </SectionCard>

            {/* 9. FIRMA Y LEGALIZACIÓN */}
            <SectionCard title="FIRMA Y LEGALIZACIÓN" icon={<GavelIcon />} color="secondary.main">
                <FormField stacked={stacked} label="Ciudad de Firma" field="lugar_firma" data={data} error={fieldErrors.lugar_firma} onChange={onChange} />
                <FormField stacked={stacked} label="Fecha de Firma" field="fecha_firma" data={data} error={fieldErrors.fecha_firma} onChange={onChange} type="date" />
            </SectionCard>
        </Box>
    );
}

export default memo(YonaContractFormSection);

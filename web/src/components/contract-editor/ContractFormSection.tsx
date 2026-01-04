import { memo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Grid,
  Typography,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  AttachMoney as MoneyIcon,
  Assignment as AssignmentIcon,
  Gavel as GavelIcon,
} from '@mui/icons-material';
import type { ContractData } from '../../services/contractDraftService';

interface ContractFormSectionProps {
  data: ContractData;
  stacked?: boolean;
  fieldErrors?: Record<string, string>;
  onChange: (field: keyof ContractData, value: string) => void;
}

interface FormFieldProps {
  label: string;
  field: keyof ContractData;
  data: ContractData;
  error?: string;
  placeholder?: string;
  onChange: (field: keyof ContractData, value: string) => void;
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
        onChange={(e) => onChange(field, e.target.value)}
        size="small"
        multiline={multiline}
        rows={rows}
        type={type}
        error={!!error}
        helperText={error}
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

function ContractFormSection({ data, stacked, fieldErrors = {}, onChange }: ContractFormSectionProps) {
  return (
    <Box>
      {/* 2. ARRENDATARIO */}
      <SectionCard title="ARRENDATARIO" icon={<PersonIcon />} color="success.main">
        <FormField stacked={stacked} label="Nombre Completo" field="arrendatario_nombre" data={data} error={fieldErrors.arrendatario_nombre} onChange={onChange} md={8} />
        <FormField stacked={stacked} label="DNI / RUC" field="arrendatario_dni" data={data} error={fieldErrors.arrendatario_dni} onChange={onChange} md={4} />
        <FormField stacked={stacked} label="Domicilio Completo" field="arrendatario_domicilio" data={data} error={fieldErrors.arrendatario_domicilio} onChange={onChange} md={12} multiline rows={2} placeholder="Incluir distrito, provincia y departamento" />

        <Grid item xs={12} md={stacked ? 12 : 6}>
          <TextField
            select
            fullWidth
            label="Sexo"
            value={data.arrendatario_sexo}
            onChange={e => onChange('arrendatario_sexo', e.target.value)}
            size="small"
            SelectProps={{ native: true }}
          >
            <option value="M">Masculino (Don)</option>
            <option value="F">Femenino (Doña)</option>
          </TextField>
        </Grid>
      </SectionCard>

      {/* 5. OBJETO DEL CONTRATO */}
      <SectionCard title="OBJETO DEL CONTRATO (Cláusula Segunda)" icon={<AssignmentIcon />} color="info.main">
        <FormField stacked={stacked} label="Número de Stand" field="stand_numero" data={data} error={fieldErrors.stand_numero} onChange={onChange} />
        <FormField stacked={stacked} label="Detalles del Stand" field="stand_detalles" data={data} error={fieldErrors.stand_detalles} onChange={onChange} md={12} multiline rows={2} placeholder="Ej: CON FRENTE A LA CUADRA 6..." />
        <FormField stacked={stacked} label="Actividad Comercial" field="actividad_comercial" data={data} error={fieldErrors.actividad_comercial} onChange={onChange} md={12} placeholder="Ej: LIBRERÍA, DISEÑO GRAFICO..." />
      </SectionCard>

      {/* 6. PLAZO DEL CONTRATO */}
      <SectionCard title="PLAZO DEL CONTRATO (Cláusula Tercera)" icon={<CalendarIcon />} color="info.main">
        <FormField stacked={stacked} label="Fecha de Inicio" field="fecha_inicio" data={data} error={fieldErrors.fecha_inicio} onChange={onChange} type="date" />
        <FormField stacked={stacked} label="Fecha de Fin" field="fecha_fin" data={data} error={fieldErrors.fecha_fin} onChange={onChange} type="date" />
        <FormField stacked={stacked} label="Plazo (meses)" field="plazo_meses" data={data} error={fieldErrors.plazo_meses} onChange={onChange} />
      </SectionCard>

      {/* 7. LA MERCED CONDUCTIVA */}
      <SectionCard title="LA MERCED CONDUCTIVA (Cláusula Quinta)" icon={<MoneyIcon />} color="error.main">
        <FormField stacked={stacked} label="Renta Mensual (S/)" field="renta_mensual" data={data} error={fieldErrors.renta_mensual} onChange={onChange} />
        <FormField stacked={stacked} label="Renta en texto" field="renta_texto" data={data} error={fieldErrors.renta_texto} onChange={onChange} />
        <FormField stacked={stacked} label="Día de vencimiento" field="dia_vencimiento" data={data} error={fieldErrors.dia_vencimiento} onChange={onChange} />
        <FormField stacked={stacked} label="Días de tolerancia" field="tolerancia_dias" data={data} error={fieldErrors.tolerancia_dias} onChange={onChange} />

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">Datos Bancarios</Typography>
          </Divider>
        </Grid>

        <FormField stacked={stacked} label="Nombre del Banco" field="banco_nombre" data={data} error={fieldErrors.banco_nombre} onChange={onChange} md={12} />
        <FormField stacked={stacked} label="Número de Cuenta" field="banco_cuenta" data={data} error={fieldErrors.banco_cuenta} onChange={onChange} />
        <FormField stacked={stacked} label="Código Interbancario (CCI)" field="banco_cci" data={data} error={fieldErrors.banco_cci} onChange={onChange} />
      </SectionCard>

      {/* 8. SOBRE LOS IMPORTES PECUNIARIOS */}
      <SectionCard title="SOBRE LOS IMPORTES PECUNIARIOS (Cláusula Decimo Quinto)" icon={<MoneyIcon />} color="error.main">
        <FormField stacked={stacked} label="Adelanto (S/)" field="adelanto_monto" data={data} error={fieldErrors.adelanto_monto} onChange={onChange} />
        <FormField stacked={stacked} label="Adelanto en texto" field="adelanto_texto" data={data} error={fieldErrors.adelanto_texto} onChange={onChange} />
        <FormField stacked={stacked} label="Garantía (S/)" field="garantia_monto" data={data} error={fieldErrors.garantia_monto} onChange={onChange} />
        <FormField stacked={stacked} label="Garantía en texto" field="garantia_texto" data={data} error={fieldErrors.garantia_texto} onChange={onChange} />
        <FormField stacked={stacked} label="Penalidad diaria ($)" field="penalidad_diaria" data={data} error={fieldErrors.penalidad_diaria} onChange={onChange} />
        <FormField stacked={stacked} label="Penalidad en texto" field="penalidad_texto" data={data} error={fieldErrors.penalidad_texto} onChange={onChange} />
      </SectionCard>

      {/* 9. FIRMA Y LEGALIZACIÓN */}
      <SectionCard title="FIRMA Y LEGALIZACIÓN" icon={<GavelIcon />} color="secondary.main">
        <FormField stacked={stacked} label="Lugar de Firma" field="lugar_firma" data={data} error={fieldErrors.lugar_firma} onChange={onChange} />
        <FormField stacked={stacked} label="Fecha de Firma" field="fecha_firma" data={data} error={fieldErrors.fecha_firma} onChange={onChange} type="date" />
      </SectionCard>
    </Box>
  );
}

export default memo(ContractFormSection);


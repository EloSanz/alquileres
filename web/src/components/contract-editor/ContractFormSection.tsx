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
  Business as BusinessIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  CalendarMonth as CalendarIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
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
)});

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
      {/* 1. ENCABEZADO */}
      <SectionCard title="ENCABEZADO" icon={<DescriptionIcon />} color="primary.main">
        <FormField stacked={stacked} label="Número de Stand" field="stand_numero" data={data} error={fieldErrors.stand_numero} onChange={onChange} />
        <FormField stacked={stacked} label="Lugar de Firma" field="lugar_firma" data={data} error={fieldErrors.lugar_firma} onChange={onChange} />
      </SectionCard>

      {/* 2. ARRENDADOR */}
      <SectionCard title="ARRENDADOR" icon={<BusinessIcon />} color="primary.main">
        <FormField stacked={stacked} label="Nombre de la empresa" field="arrendador_nombre" data={data} error={fieldErrors.arrendador_nombre} onChange={onChange} md={12} />
        <FormField stacked={stacked} label="RUC" field="arrendador_ruc" data={data} error={fieldErrors.arrendador_ruc} onChange={onChange} />
        <FormField stacked={stacked} label="Nombre del Gerente General" field="gerente_nombre" data={data} error={fieldErrors.gerente_nombre} onChange={onChange} />
        <FormField stacked={stacked} label="DNI del Gerente" field="gerente_dni" data={data} error={fieldErrors.gerente_dni} onChange={onChange} placeholder="Ej: 12345678 o 12345678A" />
        <FormField stacked={stacked} label="Partida Registral del Gerente" field="gerente_partida_registral" data={data} onChange={onChange} placeholder="Ej: 05003448" />
        <FormField stacked={stacked} label="Domicilio Fiscal" field="arrendador_domicilio" data={data} error={fieldErrors.arrendador_domicilio} onChange={onChange} md={12} />
        <FormField stacked={stacked} label="Distrito" field="arrendador_distrito" data={data} error={fieldErrors.arrendador_distrito} onChange={onChange} md={4} />
        <FormField stacked={stacked} label="Provincia" field="arrendador_provincia" data={data} error={fieldErrors.arrendador_provincia} onChange={onChange} md={4} />
        <FormField stacked={stacked} label="Departamento" field="arrendador_departamento" data={data} error={fieldErrors.arrendador_departamento} onChange={onChange} md={4} />
      </SectionCard>

      {/* 3. ARRENDATARIO */}
      <SectionCard title="ARRENDATARIO" icon={<PersonIcon />} color="success.main">
        <FormField stacked={stacked} label="Nombre completo" field="arrendatario_nombre" data={data} error={fieldErrors.arrendatario_nombre} onChange={onChange} md={12} />
        <FormField stacked={stacked} label="DNI" field="arrendatario_dni" data={data} error={fieldErrors.arrendatario_dni} onChange={onChange} placeholder="Ej: 12345678 o 12345678A" />
        <FormField stacked={stacked} label="Domicilio" field="arrendatario_domicilio" data={data} error={fieldErrors.arrendatario_domicilio} onChange={onChange} md={12} />
        <FormField stacked={stacked} label="Distrito" field="arrendatario_distrito" data={data} error={fieldErrors.arrendatario_distrito} onChange={onChange} md={4} />
        <FormField stacked={stacked} label="Provincia" field="arrendatario_provincia" data={data} error={fieldErrors.arrendatario_provincia} onChange={onChange} md={4} />
        <FormField stacked={stacked} label="Departamento" field="arrendatario_departamento" data={data} error={fieldErrors.arrendatario_departamento} onChange={onChange} md={4} />
      </SectionCard>

      {/* 4. ANTECEDENTES */}
      <SectionCard title="ANTECEDENTES" icon={<HomeIcon />} color="warning.main">
        <FormField stacked={stacked} label="Dirección del Inmueble" field="inmueble_direccion" data={data} error={fieldErrors.inmueble_direccion} onChange={onChange} md={12} />
        <FormField stacked={stacked} label="Partida Registral del Inmueble" field="inmueble_partida_registral" data={data} error={fieldErrors.inmueble_partida_registral} onChange={onChange} placeholder="Ej: 11162972" />
        <FormField stacked={stacked} label="Zona Registral" field="inmueble_zona_registral" data={data} error={fieldErrors.inmueble_zona_registral} onChange={onChange} />
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">Propietario del bien (Comodato)</Typography>
          </Divider>
        </Grid>
        
        <FormField stacked={stacked} label="Nombre del Propietario" field="propietario_nombre" data={data} error={fieldErrors.propietario_nombre} onChange={onChange} />
        <FormField stacked={stacked} label="RUC del Propietario" field="propietario_ruc" data={data} error={fieldErrors.propietario_ruc} onChange={onChange} />
        <FormField stacked={stacked} label="Domicilio del Propietario" field="propietario_domicilio" data={data} error={fieldErrors.propietario_domicilio} onChange={onChange} md={12} />
        <FormField stacked={stacked} label="Representante Legal" field="propietario_representante" data={data} error={fieldErrors.propietario_representante} onChange={onChange} />
        <FormField stacked={stacked} label="DNI del Representante" field="propietario_representante_dni" data={data} error={fieldErrors.propietario_representante_dni} onChange={onChange} />
        <FormField stacked={stacked} label="Partida Registral del Propietario" field="propietario_partida_registral" data={data} error={fieldErrors.propietario_partida_registral} onChange={onChange} placeholder="Ej: 02011638" />
        
        <FormField stacked={stacked} label="Total de Stands" field="total_stands" data={data} error={fieldErrors.total_stands} onChange={onChange} />
      </SectionCard>

      {/* 5. OBJETO DEL CONTRATO */}
      <SectionCard title="OBJETO DEL CONTRATO" icon={<AssignmentIcon />} color="info.main">
        <FormField stacked={stacked} label="Número de Stand" field="stand_numero" data={data} error={fieldErrors.stand_numero} onChange={onChange} />
      </SectionCard>

      {/* 6. PLAZO DEL CONTRATO */}
      <SectionCard title="PLAZO DEL CONTRATO" icon={<CalendarIcon />} color="info.main">
        <FormField stacked={stacked} label="Fecha de Inicio" field="fecha_inicio" data={data} error={fieldErrors.fecha_inicio} onChange={onChange} type="date" />
        <FormField stacked={stacked} label="Fecha de Fin" field="fecha_fin" data={data} error={fieldErrors.fecha_fin} onChange={onChange} type="date" />
        <FormField stacked={stacked} label="Plazo (meses)" field="plazo_meses" data={data} error={fieldErrors.plazo_meses} onChange={onChange} />
      </SectionCard>

      {/* 7. LA MERCED CONDUCTIVA */}
      <SectionCard title="LA MERCED CONDUCTIVA: FORMA Y OPORTUNIDAD DE PAGO" icon={<MoneyIcon />} color="error.main">
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
      <SectionCard title="SOBRE LOS IMPORTES PECUNIARIOS" icon={<MoneyIcon />} color="error.main">
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


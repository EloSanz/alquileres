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
  AccountBalance as BankIcon,
} from '@mui/icons-material';
import type { ContractData } from '../../services/contractDraftService';

interface ContractFormSectionProps {
  data: ContractData;
  draftName: string;
  onChange: (field: keyof ContractData, value: string) => void;
  onNameChange: (name: string) => void;
}

interface FormFieldProps {
  label: string;
  field: keyof ContractData;
  data: ContractData;
  onChange: (field: keyof ContractData, value: string) => void;
  multiline?: boolean;
  rows?: number;
  type?: string;
  xs?: number;
  md?: number;
}

const FormField = memo(({ label, field, data, onChange, multiline, rows, type = 'text', xs = 12, md = 6 }: FormFieldProps) => (
  <Grid item xs={xs} md={md}>
    <TextField
      fullWidth
      label={label}
      value={data[field]}
      onChange={(e) => onChange(field, e.target.value)}
      size="small"
      multiline={multiline}
      rows={rows}
      type={type}
    />
  </Grid>
));

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

function ContractFormSection({ data, draftName, onChange, onNameChange }: ContractFormSectionProps) {
  return (
    <Box>
      {/* Draft Name */}
      <Card sx={{ mb: 3, bgcolor: 'primary.light' }}>
        <CardContent>
          <TextField
            fullWidth
            label="Nombre del borrador"
            value={draftName}
            onChange={(e) => onNameChange(e.target.value)}
            variant="outlined"
            sx={{ bgcolor: 'white', borderRadius: 1 }}
          />
        </CardContent>
      </Card>

      {/* Arrendador Section */}
      <SectionCard title="ARRENDADOR" icon={<BusinessIcon />} color="primary.main">
        <FormField label="Nombre de la empresa" field="arrendador_nombre" data={data} onChange={onChange} md={12} />
        <FormField label="RUC" field="arrendador_ruc" data={data} onChange={onChange} />
        <FormField label="Nombre del Gerente General" field="gerente_nombre" data={data} onChange={onChange} />
        <FormField label="DNI del Gerente" field="gerente_dni" data={data} onChange={onChange} />
        <FormField label="Partida Registral del Gerente" field="gerente_partida_registral" data={data} onChange={onChange} />
        <FormField label="Domicilio Fiscal" field="arrendador_domicilio" data={data} onChange={onChange} md={12} />
        <FormField label="Distrito" field="arrendador_distrito" data={data} onChange={onChange} md={4} />
        <FormField label="Provincia" field="arrendador_provincia" data={data} onChange={onChange} md={4} />
        <FormField label="Departamento" field="arrendador_departamento" data={data} onChange={onChange} md={4} />
      </SectionCard>

      {/* Arrendatario Section */}
      <SectionCard title="ARRENDATARIO" icon={<PersonIcon />} color="success.main">
        <FormField label="Nombre completo" field="arrendatario_nombre" data={data} onChange={onChange} md={12} />
        <FormField label="DNI" field="arrendatario_dni" data={data} onChange={onChange} />
        <FormField label="Domicilio" field="arrendatario_domicilio" data={data} onChange={onChange} md={12} />
        <FormField label="Distrito" field="arrendatario_distrito" data={data} onChange={onChange} md={4} />
        <FormField label="Provincia" field="arrendatario_provincia" data={data} onChange={onChange} md={4} />
        <FormField label="Departamento" field="arrendatario_departamento" data={data} onChange={onChange} md={4} />
      </SectionCard>

      {/* Inmueble Section */}
      <SectionCard title="INMUEBLE" icon={<HomeIcon />} color="warning.main">
        <FormField label="Número de Stand" field="stand_numero" data={data} onChange={onChange} />
        <FormField label="Total de Stands" field="total_stands" data={data} onChange={onChange} />
        <FormField label="Dirección del Inmueble" field="inmueble_direccion" data={data} onChange={onChange} md={12} />
        <FormField label="Partida Registral" field="inmueble_partida_registral" data={data} onChange={onChange} />
        <FormField label="Zona Registral" field="inmueble_zona_registral" data={data} onChange={onChange} />
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">Propietario del bien (Comodato)</Typography>
          </Divider>
        </Grid>
        
        <FormField label="Nombre del Propietario" field="propietario_nombre" data={data} onChange={onChange} />
        <FormField label="RUC del Propietario" field="propietario_ruc" data={data} onChange={onChange} />
        <FormField label="Domicilio del Propietario" field="propietario_domicilio" data={data} onChange={onChange} md={12} />
        <FormField label="Representante Legal" field="propietario_representante" data={data} onChange={onChange} />
        <FormField label="DNI del Representante" field="propietario_representante_dni" data={data} onChange={onChange} />
        <FormField label="Partida Registral" field="propietario_partida_registral" data={data} onChange={onChange} />
      </SectionCard>

      {/* Fechas Section */}
      <SectionCard title="FECHAS DEL CONTRATO" icon={<CalendarIcon />} color="info.main">
        <FormField label="Fecha de Inicio" field="fecha_inicio" data={data} onChange={onChange} type="date" />
        <FormField label="Fecha de Fin" field="fecha_fin" data={data} onChange={onChange} type="date" />
        <FormField label="Plazo (meses)" field="plazo_meses" data={data} onChange={onChange} />
        <FormField label="Fecha de Firma" field="fecha_firma" data={data} onChange={onChange} type="date" />
        <FormField label="Lugar de Firma" field="lugar_firma" data={data} onChange={onChange} />
      </SectionCard>

      {/* Financiero Section */}
      <SectionCard title="DATOS FINANCIEROS" icon={<MoneyIcon />} color="error.main">
        <FormField label="Renta Mensual (S/)" field="renta_mensual" data={data} onChange={onChange} />
        <FormField label="Renta en texto" field="renta_texto" data={data} onChange={onChange} />
        <FormField label="Garantía (S/)" field="garantia_monto" data={data} onChange={onChange} />
        <FormField label="Garantía en texto" field="garantia_texto" data={data} onChange={onChange} />
        <FormField label="Adelanto (S/)" field="adelanto_monto" data={data} onChange={onChange} />
        <FormField label="Adelanto en texto" field="adelanto_texto" data={data} onChange={onChange} />
        <FormField label="Penalidad diaria ($)" field="penalidad_diaria" data={data} onChange={onChange} />
        <FormField label="Penalidad en texto" field="penalidad_texto" data={data} onChange={onChange} />
        <FormField label="Día de vencimiento" field="dia_vencimiento" data={data} onChange={onChange} />
        <FormField label="Días de tolerancia" field="tolerancia_dias" data={data} onChange={onChange} />
      </SectionCard>

      {/* Banco Section */}
      <SectionCard title="DATOS BANCARIOS" icon={<BankIcon />} color="secondary.main">
        <FormField label="Nombre del Banco" field="banco_nombre" data={data} onChange={onChange} md={12} />
        <FormField label="Número de Cuenta" field="banco_cuenta" data={data} onChange={onChange} />
        <FormField label="Código Interbancario (CCI)" field="banco_cci" data={data} onChange={onChange} />
      </SectionCard>
    </Box>
  );
}

export default memo(ContractFormSection);


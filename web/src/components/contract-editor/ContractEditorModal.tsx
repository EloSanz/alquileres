import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { Close as CloseIcon, Print as PrintIcon, Save as SaveIcon } from '@mui/icons-material';
import { useContractDraftService, type ContractData, type ContractDraft, defaultContractData } from '../../services/contractDraftService';
import ContractFormSection from './ContractFormSection';
import ContractPreview from './ContractPreview';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`contract-tabpanel-${index}`}
      aria-labelledby={`contract-tab-${index}`}
      style={{ height: '100%' }}
      {...other}
    >
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </div>
  );
}

export interface ContractEditorModalProps {
  open: boolean;
  draft?: ContractDraft | null;
  onClose: () => void;
  onSaved?: (draft: ContractDraft) => void;
}

export default function ContractEditorModal({
  open,
  draft,
  onClose,
  onSaved
}: ContractEditorModalProps) {
  const contractDraftService = useContractDraftService();
  const previewRef = useRef<HTMLDivElement>(null);
  
  const [tabValue, setTabValue] = useState(0);
  const [contractData, setContractData] = useState<ContractData>(defaultContractData);
  const [draftName, setDraftName] = useState('');
  const [draftId, setDraftId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [hasChanges, setHasChanges] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (draft) {
        setContractData(draft.data);
        setDraftName(draft.name);
        setDraftId(draft.id);
      } else {
        setContractData({ ...defaultContractData });
        setDraftName(`Contrato - ${new Date().toLocaleDateString('es-PE')}`);
        setDraftId(null);
      }
      setHasChanges(false);
      setError('');
      setNameError('');
      setFieldErrors({});
      setTabValue(0);
    }
  }, [open, draft]);

  // Auto-save every 30 seconds if there are changes
  useEffect(() => {
    if (!open || !hasChanges) return;
    
    const timer = setTimeout(() => {
      handleSave(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, [open, hasChanges, contractData]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Auto-save on tab change if there are changes
    if (hasChanges) {
      handleSave(true);
    }
  };

  const handleDataChange = useCallback((field: keyof ContractData, value: string) => {
    setContractData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);

    // Validación en tiempo real
    const newFieldErrors = { ...fieldErrors };
    let error = '';

    // Validaciones específicas por campo
    switch (field) {
      case 'arrendador_ruc':
        if (value.trim() && !/^\d{11}$/.test(value.trim())) {
          error = 'Debe tener 11 dígitos';
        }
        break;
      case 'gerente_dni':
      case 'arrendatario_dni':
        if (value.trim() && !/^(\d{7}|\d{8}|\d{8}[A-Za-z0-9])$/.test(value.trim())) {
          error = 'Debe tener 7-9 caracteres (dígitos + opcional letra)';
        }
        break;
      case 'fecha_inicio':
      case 'fecha_fin':
        if (value.trim()) {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            error = 'Fecha inválida';
          } else if (field === 'fecha_fin' && contractData.fecha_inicio) {
            const startDate = new Date(contractData.fecha_inicio);
            if (date <= startDate) {
              error = 'Debe ser posterior a fecha de inicio';
            }
          }
        }
        break;
      case 'renta_mensual':
      case 'garantia_monto':
      case 'adelanto_monto':
      case 'penalidad_diaria':
        if (value.trim()) {
          const num = parseFloat(value);
          if (isNaN(num) || num <= 0) {
            error = 'Debe ser un número positivo';
          }
        }
        break;
      case 'plazo_meses':
        if (value.trim()) {
          const num = parseInt(value);
          if (isNaN(num) || num <= 0) {
            error = 'Debe ser un número positivo';
          }
        }
        break;
      // Partida Registral: Sin validación restrictiva (acepta cualquier formato alfanumérico)
      case 'gerente_partida_registral':
      case 'inmueble_partida_registral':
      case 'propietario_partida_registral':
        // No aplicar validación - las partidas registrales pueden tener cualquier formato
        break;
    }

    if (error) {
      newFieldErrors[field] = error;
    } else {
      delete newFieldErrors[field];
    }

    setFieldErrors(newFieldErrors);
  }, [contractData.fecha_inicio, fieldErrors]);

  const handleNameChange = (name: string) => {
    setDraftName(name);
    setHasChanges(true);

    // Real-time validation
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('El nombre del borrador es requerido');
    } else if (trimmed.length < 3) {
      setNameError('El nombre debe tener al menos 3 caracteres');
    } else {
      setNameError('');
    }
  };

  const handleSave = async (silent = false) => {
    const trimmedName = draftName.trim();
    if (!trimmedName) {
      if (!silent) setError('El nombre del borrador es requerido');
      return;
    }
    if (trimmedName.length < 3) {
      if (!silent) setError('El nombre del borrador debe tener al menos 3 caracteres');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (draftId) {
        // Update existing draft
        const updated = await contractDraftService.updateDraft(draftId, {
          name: trimmedName,
          data: contractData
        });
        setDraftName(trimmedName); // Update the state with trimmed name
        if (!silent) {
          setSnackbar({ open: true, message: 'Borrador actualizado correctamente' });
        }
        onSaved?.(updated);
      } else {
        // Create new draft
        const created = await contractDraftService.createDraft({
          name: trimmedName,
          data: contractData
        });
        setDraftId(created.id);
        setDraftName(trimmedName); // Update the state with trimmed name
        if (!silent) {
          setSnackbar({ open: true, message: 'Borrador creado correctamente' });
        }
        onSaved?.(created);
      }
      setHasChanges(false);
    } catch (err: any) {
      if (!silent) {
        setError(err.message || 'Error al guardar el borrador');
      }
    } finally {
      setSaving(false);
    }
  };

  const validateRequiredFields = (): string[] => {
    const missingFields: string[] = [];

    // Campos requeridos del contrato
    if (!contractData.arrendador_nombre.trim()) missingFields.push('Nombre del Arrendador');
    if (!contractData.arrendador_ruc.trim()) missingFields.push('RUC del Arrendador');
    if (!contractData.gerente_nombre.trim()) missingFields.push('Nombre del Gerente');
    if (!contractData.gerente_dni.trim()) missingFields.push('DNI del Gerente');
    if (!contractData.arrendatario_nombre.trim()) missingFields.push('Nombre del Arrendatario');
    if (!contractData.arrendatario_dni.trim()) missingFields.push('DNI del Arrendatario');
    if (!contractData.fecha_inicio.trim()) missingFields.push('Fecha de Inicio');
    if (!contractData.fecha_fin.trim()) missingFields.push('Fecha de Fin');
    if (!contractData.renta_mensual.trim()) missingFields.push('Renta Mensual');
    if (!contractData.stand_numero.trim()) missingFields.push('Número de Stand');

    return missingFields;
  };

  const validateFieldFormats = (): string[] => {
    const formatErrors: string[] = [];

    // Validar RUC (11 dígitos)
    if (contractData.arrendador_ruc.trim() && !/^\d{11}$/.test(contractData.arrendador_ruc.trim())) {
      formatErrors.push('RUC del Arrendador debe tener 11 dígitos');
    }

    // Validar DNI del gerente (7-9 caracteres: dígitos + opcional alfanumérico)
    if (contractData.gerente_dni.trim() && !/^(\d{7}|\d{8}|\d{8}[A-Za-z0-9])$/.test(contractData.gerente_dni.trim())) {
      formatErrors.push('DNI del Gerente debe tener 7-9 caracteres (dígitos + opcional letra)');
    }

    // Validar DNI del arrendatario (7-9 caracteres: dígitos + opcional alfanumérico)
    if (contractData.arrendatario_dni.trim() && !/^(\d{7}|\d{8}|\d{8}[A-Za-z0-9])$/.test(contractData.arrendatario_dni.trim())) {
      formatErrors.push('DNI del Arrendatario debe tener 7-9 caracteres (dígitos + opcional letra)');
    }

    // Validar fechas
    if (contractData.fecha_inicio.trim()) {
      const startDate = new Date(contractData.fecha_inicio);
      if (isNaN(startDate.getTime())) {
        formatErrors.push('Fecha de Inicio no es válida');
      }
    }

    if (contractData.fecha_fin.trim()) {
      const endDate = new Date(contractData.fecha_fin);
      if (isNaN(endDate.getTime())) {
        formatErrors.push('Fecha de Fin no es válida');
      } else if (contractData.fecha_inicio.trim()) {
        const startDate = new Date(contractData.fecha_inicio);
        if (endDate <= startDate) {
          formatErrors.push('Fecha de Fin debe ser posterior a Fecha de Inicio');
        }
      }
    }

    // Validar renta mensual (número positivo)
    if (contractData.renta_mensual.trim()) {
      const rent = parseFloat(contractData.renta_mensual);
      if (isNaN(rent) || rent <= 0) {
        formatErrors.push('Renta Mensual debe ser un número positivo');
      }
    }

    // Validar plazo en meses (número positivo)
    if (contractData.plazo_meses.trim()) {
      const months = parseInt(contractData.plazo_meses);
      if (isNaN(months) || months <= 0) {
        formatErrors.push('Plazo en meses debe ser un número positivo');
      }
    }

    // Validar partida registral (alfanumérica, sin restricciones específicas)
    // La partida registral puede tener cualquier formato alfanumérico
    // No aplicamos validación restrictiva ya que varía según la SUNARP

    return formatErrors;
  };

  const handleExportPDF = async () => {
    try {
      // Validar campos requeridos
      const missingFields = validateRequiredFields();
      if (missingFields.length > 0) {
        setError(`Faltan completar los siguientes campos: ${missingFields.join(', ')}`);
        return;
      }

      // Validar formatos de campos
      const formatErrors = validateFieldFormats();
      if (formatErrors.length > 0) {
        setError(`Errores de formato: ${formatErrors.join(', ')}`);
        return;
      }

      // Dynamic import to avoid bundle size issues
      const html2pdf = (await import('html2pdf.js')).default;

      const printContent = previewRef.current;
      if (!printContent) {
        setError('Error interno: No se pudo acceder al contenido del contrato. Intente recargar la página.');
        return;
      }

      // Configure options for PDF generation
      const options = {
        margin: [20, 15, 20, 15] as [number, number, number, number], // top, left, bottom, right in mm
        filename: `${draftName || 'Contrato de Arrendamiento'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: {
          unit: 'mm' as const,
          format: 'a4' as const,
          orientation: 'portrait' as const
        }
      };

      // Generate and download PDF
      await html2pdf().set(options).from(printContent).save();

      setSnackbar({ open: true, message: 'PDF exportado correctamente' });
    } catch (err: any) {
      console.error('Error exporting PDF:', err);
      setError('Error al exportar PDF: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('Tienes cambios sin guardar. ¿Deseas guardarlos antes de salir?')) {
        handleSave();
      }
    }
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { height: '95vh', maxHeight: '95vh', display: 'flex', flexDirection: 'column' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" component="span">
              Editor de Contrato
            </Typography>
            {saving && <CircularProgress size={20} />}
            {hasChanges && !saving && (
              <Typography variant="caption" color="text.secondary">
                (sin guardar)
              </Typography>
            )}
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mx: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Formulario" id="contract-tab-0" aria-controls="contract-tabpanel-0" />
            <Tab label="Vista del Documento" id="contract-tab-1" aria-controls="contract-tabpanel-1" />
          </Tabs>
        </Box>

        <DialogContent sx={{ flex: 1, overflow: 'hidden', p: 0 }}>
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ height: '100%', overflow: 'auto', p: 3 }}>
              <ContractFormSection
                data={contractData}
                draftName={draftName}
                nameError={nameError}
                fieldErrors={fieldErrors}
                onChange={handleDataChange}
                onNameChange={handleNameChange}
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{
              height: '100%',
              overflow: 'auto',
              bgcolor: '#f5f5f5',
              p: 0,
              '@media print': {
                bgcolor: 'white !important',
                p: '0 !important'
              }
            }}>
              <Box
                ref={previewRef}
                sx={{
                  bgcolor: 'white',
                  width: '210mm', // A4 width
                  minHeight: '297mm', // A4 height
                  mx: 'auto',
                  my: 0,
                  p: 8,
                  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                  '@media print': {
                    width: 'auto !important',
                    minHeight: 'auto !important',
                    boxShadow: 'none !important',
                    p: '20mm !important'
                  }
                }}
              >
                <ContractPreview data={contractData} fullPage />
              </Box>
            </Box>
          </TabPanel>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleClose} color="inherit">
            Cerrar
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={() => handleSave()}
            variant="outlined"
            startIcon={<SaveIcon />}
            disabled={saving || !hasChanges}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
          <Button
            onClick={handleExportPDF}
            variant="contained"
            startIcon={<PrintIcon />}
          >
            Exportar PDF
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </>
  );
}


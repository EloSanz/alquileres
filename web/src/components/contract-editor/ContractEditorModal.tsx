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
  Snackbar,
} from '@mui/material';
import { Close as CloseIcon, Print as PrintIcon } from '@mui/icons-material';
import { type ContractData, type ContractDraft, defaultContractData } from '../../services/contractDraftService';

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
}

export default function ContractEditorModal({
  open,
  draft,
  onClose
}: ContractEditorModalProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  
  const [tabValue, setTabValue] = useState(0);
  const [contractData, setContractData] = useState<ContractData>(defaultContractData);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [previewReady, setPreviewReady] = useState(false);
  const [splitView, setSplitView] = useState(false);
  const [exportWarningOpen, setExportWarningOpen] = useState(false);
  const [exportWarningFields, setExportWarningFields] = useState<string[]>([]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      let initialData: ContractData;
      if (draft) {
        initialData = draft.data;
      } else {
        initialData = { ...defaultContractData };
      }

      setContractData(initialData);

      // Calcular campos faltantes inicialmente
      const missing = [];
      if (!initialData.arrendador_nombre?.trim()) missing.push('Nombre del Arrendador');
      if (!initialData.arrendador_ruc?.trim()) missing.push('RUC del Arrendador');
      if (!initialData.gerente_nombre?.trim()) missing.push('Nombre del Gerente');
      if (!initialData.gerente_dni?.trim()) missing.push('DNI del Gerente');
      if (!initialData.arrendatario_nombre?.trim()) missing.push('Nombre del Arrendatario');
      if (!initialData.arrendatario_dni?.trim()) missing.push('DNI del Arrendatario');
      if (!initialData.fecha_inicio?.trim()) missing.push('Fecha de Inicio');
      if (!initialData.fecha_fin?.trim()) missing.push('Fecha de Fin');
      if (!initialData.renta_mensual?.trim()) missing.push('Renta Mensual');
      if (!initialData.stand_numero?.trim()) missing.push('Número de Stand');
      setMissingFields(missing);

      setError('');
      setFieldErrors({});
      setTabValue(0);
    }
  }, [open, draft]);

  // Mark preview as ready when tab changes to preview tab
  useEffect(() => {
    if (tabValue === 1) {
      // Small delay to ensure the component is fully rendered
      const timer = setTimeout(() => setPreviewReady(true), 50);
      return () => clearTimeout(timer);
    } else {
      setPreviewReady(false);
    }
  }, [tabValue]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue !== 0) {
      setSplitView(false);
    }
  };

  const handleDataChange = useCallback((field: keyof ContractData, value: string) => {
    const trimmedValue = value.trim();

    setContractData(prev => {
      const newData = { ...prev, [field]: trimmedValue };

      // Calcular campos faltantes con el nuevo estado
      const missing = [];
      if (!newData.arrendador_nombre?.trim()) missing.push('Nombre del Arrendador');
      if (!newData.arrendador_ruc?.trim()) missing.push('RUC del Arrendador');
      if (!newData.gerente_nombre?.trim()) missing.push('Nombre del Gerente');
      if (!newData.gerente_dni?.trim()) missing.push('DNI del Gerente');
      if (!newData.arrendatario_nombre?.trim()) missing.push('Nombre del Arrendatario');
      if (!newData.arrendatario_dni?.trim()) missing.push('DNI del Arrendatario');
      if (!newData.fecha_inicio?.trim()) missing.push('Fecha de Inicio');
      if (!newData.fecha_fin?.trim()) missing.push('Fecha de Fin');
      if (!newData.renta_mensual?.trim()) missing.push('Renta Mensual');
      if (!newData.stand_numero?.trim()) missing.push('Número de Stand');

      setMissingFields(missing);

      // Actualizar errores de formato en tiempo real
      const formatErrorArray = validateFieldFormats();
      const formatErrors: Record<string, string> = {};
      formatErrorArray.forEach(error => {
        // Convertir mensaje de error a clave de campo (simplificado)
        const fieldMatch = error.match(/(.+?)\s+debe/);
        if (fieldMatch) {
          const fieldName = fieldMatch[1].toLowerCase().replace(/\s+/g, '_');
          formatErrors[fieldName] = error;
        }
      });
      setFieldErrors(formatErrors);

      return newData;
    });

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

  const handleConfirmExportPDF = async () => {
    setExportWarningOpen(false);

    try {
      // Continuar con la validación normal
      const formatErrors = validateFieldFormats();

      if (formatErrors.length > 0) {
        console.log('❌ Errores de formato:', formatErrors);
        setError(`Errores de formato: ${formatErrors.join(', ')}`);
        return;
      }

      console.log('✅ Validaciones pasaron, cambiando a vista previa...');

      // Cambiar a la tab de preview si no estamos ahí
      if (tabValue !== 1) {
        setTabValue(1);
        // Esperar a que el preview esté listo
        await new Promise<void>((resolve) => {
          const checkReady = () => {
            if (previewReady && previewRef.current) {
              console.log('✅ Preview listo, procediendo con exportación');
              resolve();
            } else {
              setTimeout(checkReady, 50);
            }
          };
          setTimeout(checkReady, 50);
        });
      }

      // Exportación nativa por impresión para máxima fidelidad
      const contentRoot = previewRef.current;
      if (!contentRoot) {
          setError('Error interno: No se pudo acceder al contenido del contrato.');
          return;
        }

      // Crear un nuevo documento con solo el contenido del contrato
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        setError('No se pudo abrir la ventana de impresión. Verifica que no estén bloqueados los pop-ups.');
        return;
      }

      // Copiar estilos CSS
      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            return '';
          }
        })
        .join('\n');

      // Crear el HTML para impresión
      const printHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Contrato de Arrendamiento</title>
            <meta charset="UTF-8">
            <style>
              ${styles}
              @page {
                size: A4;
                margin: 1cm;
              }
              body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #000;
                margin: 0;
                padding: 20px;
              }
              .contract-content {
                max-width: none;
                margin: 0;
                padding: 0;
              }
              .no-print {
                display: none !important;
              }
              @media print {
                body { margin: 0; }
                .page-break { page-break-before: always; }
              }
            </style>
          </head>
          <body>
            <div class="contract-content">
              ${contentRoot.innerHTML}
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(printHTML);
      printWindow.document.close();

      // Esperar a que se cargue y mostrar diálogo de impresión
      printWindow.onload = () => {
        printWindow.print();
        // Cerrar después de un tiempo prudencial
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      };

      console.log('✅ PDF exportado exitosamente');

    } catch (error) {
      console.error('❌ Error en exportación PDF:', error);
      setError('Error al generar el PDF. Intente nuevamente o use la función de impresión del navegador.');
    }
  };

  const handleExportPDF = async () => {

    try {
      console.log('🚀 Iniciando exportación PDF...');

      // Validar campos requeridos para exportación PDF
      const exportRequiredFields = [
        { key: 'arrendatario_nombre', label: 'Nombre del Arrendatario' },
        { key: 'arrendatario_dni', label: 'DNI del Arrendatario' },
        { key: 'stand_numero', label: 'Número de Stand' }
      ];

      const missingExportFields = exportRequiredFields
        .filter(field => !contractData[field.key as keyof typeof contractData]?.trim())
        .map(field => field.label);

      if (missingExportFields.length > 0) {
        setExportWarningFields(missingExportFields);
        setExportWarningOpen(true);
        return;
      }

      // Validar formatos de campos
      const formatErrors = validateFieldFormats();
      if (formatErrors.length > 0) {
        console.log('❌ Errores de formato:', formatErrors);
        setError(`Errores de formato: ${formatErrors.join(', ')}`);
        return;
      }

      console.log('✅ Validaciones pasaron, cambiando a vista previa...');

      // Cambiar a la tab de preview si no estamos ahí
      if (tabValue !== 1) {
        setTabValue(1);
        // Esperar a que el preview esté listo
        await new Promise<void>((resolve) => {
          const checkReady = () => {
            if (previewReady && previewRef.current) {
              console.log('✅ Preview listo, procediendo con exportación');
              resolve();
            } else {
              setTimeout(checkReady, 50);
            }
          };
          setTimeout(checkReady, 50);
        });
      }

      // Exportación nativa por impresión para máxima fidelidad
      const contentRoot = previewRef.current;
      if (!contentRoot) {
          setError('Error interno: No se pudo acceder al contenido del contrato.');
          return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          setError('No se pudo abrir la ventana de impresión. Verifica que no estén bloqueados los pop-ups.');
          return;
        }

      const html = contentRoot.outerHTML;
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
            <title>Contrato de Arrendamiento</title>
              <style>
              @page { size: A4; margin: 20mm; }
              body { margin: 0; padding: 0; }
              </style>
            </head>
          <body>${html}</body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
      }, 300);
      setSnackbar({ open: true, message: 'Documento listo para imprimir/guardar como PDF' });
    } catch (err: any) {
        setError('Error al generar el PDF. Intente nuevamente o use la función de impresión del navegador.');
    }
  };

  const handleClose = () => {
    onClose();
    setSplitView(false);
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
                {splitView ? (
                  <Box sx={{ height: '100%', display: 'flex', gap: 2, overflow: 'hidden', p: 0 }}>
                    <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                      {missingFields.length > 0 && (
                        <Box
                          sx={{
                            position: 'sticky',
                            top: 0,
                            zIndex: 10,
                            mb: 2,
                            p: 2,
                            borderRadius: 2,
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          <Typography
                            variant="body1"
                            color="primary.main"
                            fontWeight="bold"
                            sx={{ fontSize: '1.1rem' }}
                          >
                            ⚠️ Campos requeridos pendientes: {missingFields.join(', ')}
                          </Typography>
                        </Box>
                      )}
                      <ContractFormSection
                        stacked
                        data={contractData}
                        fieldErrors={fieldErrors}
                        onChange={handleDataChange}
                      />
                    </Box>
                    <Box sx={{
                      flex: 1,
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
                          width: '210mm',
                          minHeight: '297mm',
                          mx: 'auto',
                          my: 0,
                          p: '20mm',
                          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                          fontFamily: '"Times New Roman", Times, serif',
                          lineHeight: 1.5,
                          fontSize: '11pt',
                          color: '#000',
                          '@media print': {
                            width: 'auto !important',
                            minHeight: 'auto !important',
                            boxShadow: 'none !important',
                            margin: '0 !important',
                            padding: '15mm 20mm !important'
                          }
                        }}
                      >
                        <ContractPreview data={contractData} fullPage />
                      </Box>
                    </Box>
                  </Box>
                ) : (
                <Box sx={{ height: '100%', overflow: 'auto', p: 3 }}>
                  {missingFields.length > 0 && (
                    <Box
                      sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        mb: 2,
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <Typography
                        variant="body1"
                        color="primary.main"
                        fontWeight="bold"
                          sx={{ fontSize: '1.1rem' }}
                      >
                        ⚠️ Campos requeridos pendientes: {missingFields.join(', ')}
                      </Typography>
                    </Box>
                  )}
                  <ContractFormSection
                    data={contractData}
                    fieldErrors={fieldErrors}
                    onChange={handleDataChange}
                  />
                </Box>
                )}
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
                  p: '20mm', // Márgenes consistentes
                  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                  fontFamily: '"Times New Roman", Times, serif',
                  lineHeight: 1.5,
                  fontSize: '11pt',
                  color: '#000',
                  '@media print': {
                    width: 'auto !important',
                    minHeight: 'auto !important',
                    boxShadow: 'none !important',
                    margin: '0 !important',
                    padding: '15mm 20mm !important'
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
          {tabValue === 0 && (
          <Button
              onClick={() => setSplitView(v => !v)}
            variant="outlined"
          >
              {splitView ? 'Cerrar vista paralela' : 'Vista previa en paralelo'}
          </Button>
          )}
          <Button
            onClick={tabValue === 0 ? () => setTabValue(1) : handleExportPDF}
            variant="contained"
            startIcon={tabValue === 0 ? undefined : <PrintIcon />}
          >
            {tabValue === 0 ? 'Vista Previa' : 'Exportar PDF'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de advertencia para exportación PDF */}
      <Dialog
        open={exportWarningOpen}
        onClose={() => setExportWarningOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          ⚠️ Campos requeridos faltantes
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Faltan completar los siguientes campos para exportar el PDF:
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0 }}>
            {exportWarningFields.map((field, index) => (
              <Typography key={index} component="li" variant="body2">
                {field}
              </Typography>
            ))}
          </Box>
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            ¿Desea continuar con la exportación de todos modos?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportWarningOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmExportPDF} variant="contained" color="primary">
            Continuar con exportación
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


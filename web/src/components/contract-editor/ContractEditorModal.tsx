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

 // Función para generar PDF usando jsPDF puro (texto nativo seleccionable)
async function generateContractPDF(contractData: ContractData, _previewRef: React.RefObject<HTMLDivElement>, fileName: string): Promise<void> {
  const { jsPDF } = await import('jspdf');

  // Crear documento PDF con configuración optimizada
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const leftMargin = 25;
  const rightMargin = 25;
  const topMargin = 30;
  const bottomMargin = 25;
  const contentWidth = pageWidth - leftMargin - rightMargin;
  let yPosition = topMargin;

  // Configurar fuente por defecto (Times New Roman)
  pdf.setFont('times', 'normal');

  // Función helper para agregar texto con formato automático
  const addText = (text: string, options: {
    fontSize?: number;
    fontStyle?: 'normal' | 'bold' | 'italic';
    align?: 'left' | 'center' | 'right';
    indent?: number;
    lineSpacing?: number;
  } = {}) => {
    const {
      fontSize = 11,
      fontStyle = 'normal',
      align = 'left',
      indent = 0,
      lineSpacing = 1.3
    } = options;

    pdf.setFont('times', fontStyle);
    pdf.setFontSize(fontSize);

    // Dividir texto en líneas que quepan
    const lines = pdf.splitTextToSize(text, contentWidth - indent);
    const lineHeight = fontSize * 0.4 * lineSpacing;

    for (const line of lines) {
      // Verificar si necesitamos nueva página
      if (yPosition > pageHeight - bottomMargin - 10) {
        pdf.addPage();
        yPosition = topMargin;
      }

      // Calcular posición X según alineación
      let xPosition = leftMargin + indent;
      if (align === 'center') {
        xPosition = pageWidth / 2;
      } else if (align === 'right') {
        xPosition = pageWidth - rightMargin;
      }

      // Dibujar el texto (esto crea TEXTO REAL, no imagen)
      pdf.text(line, xPosition, yPosition, { align });
      yPosition += lineHeight;
    }

    // Espacio adicional después del párrafo
    yPosition += fontSize * 0.2;
  };

  // Función para agregar línea divisoria
  const addDivider = () => {
    yPosition += 5;
    pdf.setLineWidth(0.3);
    pdf.line(leftMargin, yPosition, pageWidth - rightMargin, yPosition);
    yPosition += 8;
  };

  // Función para formato de fecha
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '[FECHA PENDIENTE]';
    try {
      const date = new Date(dateStr);
      const day = date.getDate().toString().padStart(2, '0');
      const months = [
        'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
        'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
      ];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} de ${month} del ${year}`;
    } catch {
      return '[FECHA INVÁLIDA]';
    }
  };

  // Título principal
  addText('CONTRATO DE ARRENDAMIENTO COMERCIAL', {
    fontSize: 16,
    fontStyle: 'bold',
    align: 'center'
  });

  addText(`Stand N.° ${contractData.stand_numero || '[PENDIENTE]'} - ${contractData.lugar_firma || 'Pucallpa'}, Perú`, {
    fontSize: 12,
    align: 'center'
  });

  yPosition += 5;
  addDivider();

  // Introducción del contrato
  addText(`Conste por el presente documento el Contrato de Arrendamiento que celebran de una parte ` +
    `${contractData.arrendador_nombre || '[NOMBRE ARRENDADOR PENDIENTE]'}, identificado con RUC N.° ` +
    `${contractData.arrendador_ruc || '[RUC PENDIENTE]'}, debidamente representada por el ` +
    `GERENTE GENERAL Sr. ${contractData.gerente_nombre || '[NOMBRE GERENTE PENDIENTE]'}, identificado con DNI N.° ` +
    `${contractData.gerente_dni || '[DNI GERENTE PENDIENTE]'}` +
    `${contractData.gerente_partida_registral ? `, según poder inscrito en la partida electrónica N.° ${contractData.gerente_partida_registral} del registro de personas jurídicas` : ''}, ` +
    `con domicilio fiscal sito en ${contractData.arrendador_domicilio || '[DOMICILIO PENDIENTE]'}, del distrito de ` +
    `${contractData.arrendador_distrito || '[DISTRITO]'}, provincia de ` +
    `${contractData.arrendador_provincia || '[PROVINCIA]'}, departamento de ` +
    `${contractData.arrendador_departamento || '[DEPARTAMENTO]'}` +
    `${contractData.arrendador_distrito && contractData.arrendador_provincia && contractData.arrendador_departamento ? ', que en lo sucesivo se denominará EL ARRENDADOR' : ''} y de la otra parte, ` +
    `Doña ${contractData.arrendatario_nombre || '[NOMBRE ARRENDATARIO PENDIENTE]'}, identificado con D.N.I. N.° ` +
    `${contractData.arrendatario_dni || '[DNI ARRENDATARIO PENDIENTE]'}, ` +
    `con domicilio en ${contractData.arrendatario_domicilio || '[DOMICILIO PENDIENTE]'}, distrito de ` +
    `${contractData.arrendatario_distrito || '[DISTRITO]'}, provincia de ` +
    `${contractData.arrendatario_provincia || '[PROVINCIA]'} y departamento de ` +
    `${contractData.arrendatario_departamento || '[DEPARTAMENTO]'}` +
    `${contractData.arrendatario_distrito && contractData.arrendatario_provincia && contractData.arrendatario_departamento ? ', a quien en adelante se le denominará EL ARRENDATARIO' : ''} en los términos y condiciones de las cláusulas siguientes.`);

  addDivider();

  // ANTECEDENTES
  addText('ANTECEDENTES', { fontSize: 12, fontStyle: 'bold' });
  yPosition += 3;

  addText(`PRIMERA: ${contractData.arrendador_nombre || '[ARRENDADOR]'} es conductor del inmueble ubicado sito en ` +
    `${contractData.inmueble_direccion || '[DIRECCIÓN PENDIENTE]'}, distrito de ` +
    `${contractData.arrendador_distrito || '[DISTRITO]'}, provincia de ` +
    `${contractData.arrendador_provincia || '[PROVINCIA]'}, departamento de ` +
    `${contractData.arrendador_departamento || '[DEPARTAMENTO]'}` +
    `${contractData.inmueble_partida_registral ? `, el mismo que se encuentra inscrito en la Partida Registral N.° ${contractData.inmueble_partida_registral}` : ''}` +
    `${contractData.inmueble_zona_registral ? `, del Registro de la Propiedad Inmueble de la Zona Registral N.° ${contractData.inmueble_zona_registral}` : ''}` +
    `${contractData.propietario_nombre ? `, en mérito al Contrato de Comodato, mediante la cual la empresa propietaria del bien ${contractData.propietario_nombre}, identificado con RUC N.° ${contractData.propietario_ruc || '[RUC]'}` : ''}` +
    `${contractData.propietario_domicilio ? `, con domicilio fiscal sito en ${contractData.propietario_domicilio}` : ''}` +
    `${contractData.propietario_representante ? `, debidamente representado por su Apoderado Legal ${contractData.propietario_representante}, identificado con DNI N.° ${contractData.propietario_representante_dni || '[DNI]'}` : ''}` +
    `${contractData.propietario_partida_registral ? `, conforme consta en su Certificado de Vigencia, inscrito en la Partida Registral N.° ${contractData.propietario_partida_registral}, del Registro de Personas Jurídicas` : ''}` +
    `${contractData.propietario_representante ? ', otorga el bien en COMODATO CON CLÁUSULA DE AUTORIZACIÓN DE SUBARRIENDO (ANEXO 01-B), en favor de la empresa LA EMPRESA INMOBILIARIA PENTA MONT S.A..' : ''}`);

  if (contractData.total_stands) {
    addText(`Que, sobre el bien inmueble descrito en el párrafo anterior se ha construido ${contractData.total_stands} stands.`);
  }

  addDivider();

  // OBJETO DEL CONTRATO
  addText('OBJETO DEL CONTRATO', { fontSize: 12, fontStyle: 'bold' });
  yPosition += 3;

  addText(`SEGUNDA: Por el Presente documento, ${contractData.arrendador_nombre || '[ARRENDADOR]'} da en arrendamiento a ` +
    `${contractData.arrendatario_nombre || '[ARRENDATARIO]'} EL INMUEBLE de su propiedad, referido en la cláusula primera ` +
    `anterior, a fin de que sea ocupado por ${contractData.arrendatario_nombre || '[ARRENDATARIO]'}; el ` +
    `STAND N.° ${contractData.stand_numero || '[NÚMERO]'} siendo este mismo destinado para el desarrollo de la actividad comercial.`);

  addText(`${contractData.arrendatario_nombre || '[ARRENDATARIO]'} declara conocer y reconocer que tanto EL INMUEBLE materia de ` +
    `este contrato como los accesorios que igualmente son objeto del presente arrendamiento, se encuentran en perfecto ` +
    `estado de conservación y funcionamiento, y en tal sentido se obliga a devolverlos en el estado en que los recibe.`);

  addDivider();

  // PLAZO DEL CONTRATO
  addText('PLAZO DEL CONTRATO', { fontSize: 12, fontStyle: 'bold' });
  yPosition += 3;

  addText(`TERCERA: El plazo del presente contrato de arrendamiento, pactado de común acuerdo por las partes ` +
    `contratantes, es por el período de ${contractData.plazo_meses || '[MESES]'} meses, que se inicia el ${formatDate(contractData.fecha_inicio)} ` +
    `y concluye el ${formatDate(contractData.fecha_fin)}.`);

  if (contractData.arrendatario_nombre) {
    addText(`En caso de que ${contractData.arrendatario_nombre} deseara prorrogar el plazo del presente ` +
      `contrato, deberá solicitarlo a ${contractData.arrendador_nombre || '[ARRENDADOR]'} con una anticipación no menor ` +
      `de TREINTA (30) días a la fecha de conclusión del arrendamiento.`);

    addText(`En el supuesto que, a la terminación del presente contrato, por vencimiento del plazo o por resolución del contrato, ` +
      `${contractData.arrendatario_nombre} no cumpliese con entregar EL INMUEBLE arrendado a ${contractData.arrendador_nombre || '[ARRENDADOR]'}, ` +
      `y sin perjuicio de entenderse que el presente contrato no continúa, ${contractData.arrendatario_nombre} queda obligado a pagar a ` +
      `${contractData.arrendador_nombre || '[ARRENDADOR]'} una penalidad de ${contractData.penalidad_diaria ? 'S/ ' + contractData.penalidad_diaria : '$ [MONTO]'} ` +
      `(${contractData.penalidad_texto || '[MONTO EN LETRAS]'}) por cada día de demora hasta la entrega efectiva de los inmuebles y sus accesorios a ` +
      `${contractData.arrendador_nombre || '[ARRENDADOR]'}.`);
  }

  addDivider();

  // LA MERCED CONDUCTIVA
  addText('LA MERCED CONDUCTIVA: FORMA Y OPORTUNIDAD DE PAGO', { fontSize: 12, fontStyle: 'bold' });
  yPosition += 3;

  addText(`SEXTA: El pago de la renta mensual, convenida de mutuo acuerdo por las partes contratantes, es de ` +
    `S/${contractData.renta_mensual || '[MONTO]'} (${contractData.renta_texto || '[MONTO EN LETRAS]'}), por el arrendamiento de EL INMUEBLE.`);

  if (contractData.dia_vencimiento || contractData.tolerancia_dias) {
    addText(`Cabe señalar que el pago de la renta será abonado los ${contractData.dia_vencimiento || '[DÍA]'} de cada mes, ` +
      `con una tolerancia de ${contractData.tolerancia_dias || '[DÍAS]'} días calendarios siguientes a su vencimiento.`);
  }

  if (contractData.banco_nombre || contractData.banco_cuenta) {
    addText(`SÉTIMA: La renta será pagada por ${contractData.arrendatario_nombre || '[ARRENDATARIO]'} mediante abono en la cuenta de ` +
      `Ahorros Soles del ${contractData.banco_nombre || '[BANCO]'} N.° ${contractData.banco_cuenta || '[CUENTA]'}` +
      `${contractData.banco_cci ? `, con Código Interbancario N.° ${contractData.banco_cci}` : ''}, de propiedad de ` +
      `${contractData.arrendador_nombre || '[ARRENDADOR]'}.`);
  }

  if (contractData.arrendatario_nombre) {
    addText(`El incumplimiento de pago oportuno de dos meses y 15 días consecutivos de renta constituye causal de resolución automática del presente contrato, ` +
      `sin necesidad de previo pronunciamiento judicial.`);
  }

  // Espacio para firmas si hay suficiente espacio
  if (yPosition > pageHeight - bottomMargin - 80) {
    pdf.addPage();
    yPosition = topMargin;
  }

  yPosition += 15;

  // Firmas
  const firmaY = yPosition + 40;
  const leftX = leftMargin + 20;
  const rightX = pageWidth - rightMargin - 60;

  // Líneas de firma
  pdf.setLineWidth(0.2);
  pdf.line(leftX, firmaY, leftX + 60, firmaY);
  pdf.line(rightX, firmaY, rightX + 60, firmaY);

  // Texto de firmas
  pdf.setFontSize(10);
  pdf.text(`${contractData.arrendatario_nombre || '[ARRENDATARIO]'}`, leftX + 30, firmaY + 15, { align: 'center' });
  pdf.text('ARRENDATARIO', leftX + 30, firmaY + 25, { align: 'center' });

  pdf.text(`${contractData.arrendador_nombre || '[ARRENDADOR]'}`, rightX + 30, firmaY + 15, { align: 'center' });
  pdf.text('ARRENDADOR', rightX + 30, firmaY + 25, { align: 'center' });

  // Fecha y lugar
  pdf.text(`${contractData.lugar_firma || 'Pucallpa'}, ${formatDate(contractData.fecha_firma)}`, pageWidth / 2, firmaY + 45, { align: 'center' });

  // Descargar el PDF
  pdf.save(`${fileName}.pdf`);
}
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
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [previewReady, setPreviewReady] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      let initialData: ContractData;
      if (draft) {
        initialData = draft.data;
        setDraftName(draft.name);
        setDraftId(draft.id);
      } else {
        initialData = { ...defaultContractData };
        setDraftName(`Contrato - ${new Date().toLocaleDateString('es-PE')}`);
        setDraftId(null);
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
    // Auto-save on tab change if there are changes
    if (hasChanges) {
      handleSave(true);
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
    let fallbackPrintContent: HTMLElement | null = null;

    try {
      console.log('🚀 Iniciando exportación PDF...');

      // Validar campos requeridos
      const missingFields = validateRequiredFields();
      if (missingFields.length > 0) {
        setError(`Faltan completar los siguientes campos: ${missingFields.join(', ')}`);
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

      // Método programático: Generar PDF usando el componente ContractPreview renderizado
      try {
        await generateContractPDF(contractData, previewRef, draftName || 'Contrato de Arrendamiento');
        setSnackbar({ open: true, message: 'PDF generado correctamente' });

      } catch (programmaticError) {
        console.warn('Método programático falló, usando html2canvas:', programmaticError);

        // Fallback a html2pdf con configuración optimizada
        const html2pdf = (await import('html2pdf.js')).default;

        fallbackPrintContent = previewRef.current;
        if (!fallbackPrintContent) {
          setError('Error interno: No se pudo acceder al contenido del contrato.');
          return;
        }

        // Configure options for PDF generation - Optimizado para texto
        const options = {
          margin: [25, 20, 25, 20] as [number, number, number, number],
          filename: `${draftName || 'Contrato de Arrendamiento'}.pdf`,
          html2canvas: {
            scale: 1,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            logging: false,
            ignoreElements: (element: any) => {
              // Ignorar elementos que puedan causar problemas
              return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
            }
          },
          jsPDF: {
            unit: 'mm' as const,
            format: 'a4' as const,
            orientation: 'portrait' as const
          }
        };

        // Generate and download PDF
        await html2pdf().set(options).from(fallbackPrintContent).save();

        setSnackbar({ open: true, message: 'PDF exportado correctamente' });
      }
    } catch (err: any) {
      console.error('html2pdf falló, intentando método alternativo:', err);

      try {
        // Método alternativo: abrir en nueva ventana con estilos de impresión
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          setError('No se pudo abrir la ventana de impresión. Verifica que no estén bloqueados los pop-ups.');
          return;
        }

        const content = fallbackPrintContent ? (fallbackPrintContent as HTMLElement).innerHTML : '';
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${draftName || 'Contrato de Arrendamiento'}</title>
              <style>
                @page {
                  size: A4;
                  margin: 2cm;
                }
                @media print {
                  body {
                    font-family: 'Times New Roman', Times, serif !important;
                    font-size: 11pt !important;
                    line-height: 1.6 !important;
                    color: #000 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    max-width: 170mm !important;
                    margin: 0 auto !important;
                  }
                  * {
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                  }
                }
                body {
                  font-family: 'Times New Roman', Times, serif;
                  font-size: 11pt;
                  line-height: 1.6;
                  color: #000;
                  margin: 0;
                  padding: 20px;
                  max-width: 170mm;
                  margin: 0 auto;
                }
                h1 {
                  text-align: center;
                  font-size: 14pt;
                  margin-bottom: 0.5cm;
                  font-weight: bold;
                }
                h2 {
                  font-size: 12pt;
                  margin-top: 0.5cm;
                  margin-bottom: 0.3cm;
                  border-bottom: 1px solid #000;
                  font-weight: bold;
                }
                p {
                  text-align: justify;
                  margin-bottom: 0.3cm;
                  hyphens: auto;
                  word-wrap: break-word;
                }
                strong {
                  font-weight: bold;
                }
              </style>
            </head>
            <body>
              ${content}
            </body>
          </html>
        `);
        printWindow.document.close();

        // Esperar a que cargue y mostrar diálogo de impresión
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          setSnackbar({ open: true, message: 'Documento listo para impresión/imprimir como PDF' });
        }, 500);

      } catch (fallbackError: any) {
        console.error('Método alternativo también falló:', fallbackError);
        setError('Error al generar el PDF. Intente nuevamente o use la función de impresión del navegador.');
      }
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
                        color="white"
                        fontWeight="bold"
                        sx={{
                          fontSize: '1.1rem'
                        }}
                      >
                        ⚠️ Campos requeridos pendientes: {missingFields.join(', ')}
                      </Typography>
                    </Box>
                  )}
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
          <Button
            onClick={() => handleSave()}
            variant="outlined"
            startIcon={<SaveIcon />}
            disabled={saving || !hasChanges}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
          <Button
            onClick={tabValue === 0 ? () => setTabValue(1) : handleExportPDF}
            variant="contained"
            startIcon={tabValue === 0 ? undefined : <PrintIcon />}
          >
            {tabValue === 0 ? 'Vista Previa' : 'Exportar PDF'}
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


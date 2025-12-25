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
  }, []);

  const handleNameChange = (name: string) => {
    setDraftName(name);
    setHasChanges(true);
  };

  const handleSave = async (silent = false) => {
    if (!draftName.trim()) {
      if (!silent) setError('El nombre del borrador es requerido');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (draftId) {
        // Update existing draft
        const updated = await contractDraftService.updateDraft(draftId, {
          name: draftName,
          data: contractData
        });
        if (!silent) {
          setSnackbar({ open: true, message: 'Borrador actualizado correctamente' });
        }
        onSaved?.(updated);
      } else {
        // Create new draft
        const created = await contractDraftService.createDraft({
          name: draftName,
          data: contractData
        });
        setDraftId(created.id);
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

  const handleExportPDF = () => {
    // Open print dialog for the preview content
    const printContent = previewRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setError('No se pudo abrir la ventana de impresión. Verifica que no estén bloqueados los pop-ups.');
      return;
    }

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
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 11pt;
              line-height: 1.5;
              color: #000;
            }
            h1 {
              text-align: center;
              font-size: 14pt;
              margin-bottom: 0.5cm;
            }
            h2 {
              font-size: 12pt;
              margin-top: 0.5cm;
              margin-bottom: 0.3cm;
              border-bottom: 1px solid #000;
            }
            p {
              text-align: justify;
              margin-bottom: 0.3cm;
            }
            strong {
              font-weight: bold;
            }
            .firma-section {
              margin-top: 2cm;
              display: flex;
              justify-content: space-between;
            }
            .firma-box {
              width: 40%;
              text-align: center;
            }
            .firma-linea {
              border-top: 1px solid #000;
              margin-top: 2cm;
              padding-top: 0.3cm;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
            <Tab label="Vista Previa" id="contract-tab-1" aria-controls="contract-tabpanel-1" />
            <Tab label="Página Completa" id="contract-tab-2" aria-controls="contract-tabpanel-2" />
          </Tabs>
        </Box>

        <DialogContent sx={{ flex: 1, overflow: 'hidden', p: 0 }}>
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ height: '100%', overflow: 'auto', p: 3 }}>
              <ContractFormSection
                data={contractData}
                draftName={draftName}
                onChange={handleDataChange}
                onNameChange={handleNameChange}
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ height: '100%', overflow: 'auto', p: 3, bgcolor: 'grey.100' }}>
              <Box
                ref={previewRef}
                sx={{
                  bgcolor: 'white',
                  p: 4,
                  maxWidth: 800,
                  mx: 'auto',
                  boxShadow: 3,
                  minHeight: '100%'
                }}
              >
                <ContractPreview data={contractData} />
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ height: '100%', overflow: 'auto', bgcolor: 'grey.100' }}>
              <Box
                ref={tabValue === 2 ? previewRef : undefined}
                sx={{
                  bgcolor: 'white',
                  p: 6,
                  maxWidth: 900,
                  mx: 'auto',
                  my: 2,
                  boxShadow: 3
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


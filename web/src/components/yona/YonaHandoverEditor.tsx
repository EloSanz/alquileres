import React, { useState, useRef, useEffect } from 'react';
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
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { Close as CloseIcon, Print as PrintIcon } from '@mui/icons-material';
import { type YonaHandoverData, defaultYonaHandoverData } from '../../services/yonaContractService';

import YonaHandoverFormSection from './YonaHandoverFormSection';
import YonaHandoverPreview from './YonaHandoverPreview';

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
            id={`handover-tabpanel-${index}`}
            aria-labelledby={`handover-tab-${index}`}
            style={{ height: '100%' }}
            {...other}
        >
            {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
        </div>
    );
}

export interface YonaHandoverEditorProps {
    open: boolean;
    onClose: () => void;
}

export default function YonaHandoverEditor({
    open,
    onClose
}: YonaHandoverEditorProps) {
    const previewRef = useRef<HTMLDivElement>(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [tabValue, setTabValue] = useState(0);
    const [handoverData, setHandoverData] = useState<YonaHandoverData>(defaultYonaHandoverData);
    const [error, setError] = useState('');
    const [splitView, setSplitView] = useState(!isMobile);

    useEffect(() => {
        setSplitView(!isMobile);
    }, [isMobile]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        if (newValue === 0 && !isMobile) setSplitView(true);
        else setSplitView(false);
    };

    const handleDataChange = (field: keyof YonaHandoverData, value: string) => {
        setHandoverData(prev => ({ ...prev, [field]: value }));
    };

    const handleExportPDF = () => {
        try {
            if (!previewRef.current) return;

            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                setError('No se pudo abrir la ventana de impresión.');
                return;
            }

            const html = previewRef.current.outerHTML;
            printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
            <title>Acta de Entrega</title>
              <style>
              @page { size: A4; margin: 0; }
              body { margin: 0; padding: 25mm; font-family: 'Times New Roman', serif; }
              </style>
            </head>
          <body>${html}</body>
          </html>
        `);
            printWindow.document.close();
            printWindow.document.title = 'Acta de Entrega';

            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 500);
        } catch (err) {
            setError('Error al exportar.');
        }
    };

    const handleClose = () => {
        onClose();
        setSplitView(false);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="xl"
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
                sx: { height: '95vh', maxHeight: '95vh', display: 'flex', flexDirection: 'column' }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Typography variant="h6">Editor de Acta de Entrega (YONA)</Typography>
                <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>

            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mx: 3 }}>{error}</Alert>}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, display: splitView ? 'none' : 'block' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Formulario" />
                    <Tab label="Vista del Documento" />
                </Tabs>
            </Box>

            <DialogContent sx={{ flex: 1, overflow: 'hidden', p: 0 }}>
                {splitView ? (
                    <Box sx={{ height: '100%', display: 'flex', gap: 2, overflow: 'hidden', p: 0 }}>
                        <Box sx={{ flex: 1, overflow: 'auto', p: 3, borderRight: 1, borderColor: 'divider' }}>
                            <YonaHandoverFormSection data={handoverData} onChange={handleDataChange} />
                        </Box>
                        <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#f5f5f5', p: 2 }}>
                            <Box ref={previewRef} sx={{ bgcolor: 'white', width: '210mm', minHeight: '297mm', mx: 'auto', p: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                                <YonaHandoverPreview data={handoverData} fullPage />
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <>
                        <TabPanel value={tabValue} index={0}>
                            <Box sx={{ height: '100%', overflow: 'auto', p: 3 }}>
                                <YonaHandoverFormSection data={handoverData} onChange={handleDataChange} />
                            </Box>
                        </TabPanel>
                        <TabPanel value={tabValue} index={1}>
                            <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#f5f5f5', p: 0 }}>
                                <Box ref={previewRef} sx={{ bgcolor: 'white', width: '210mm', minHeight: '297mm', mx: 'auto', my: 2, p: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                                    <YonaHandoverPreview data={handoverData} fullPage />
                                </Box>
                            </Box>
                        </TabPanel>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
                <Button onClick={handleClose} color="inherit">Cerrar</Button>
                <Box sx={{ flex: 1 }} />
                {!isMobile && (
                    <Button onClick={() => setSplitView(v => !v)} variant="outlined" color="secondary">
                        {splitView ? 'Vista de Pestañas' : 'Vista Dividida'}
                    </Button>
                )}
                <Button onClick={handleExportPDF} variant="contained" startIcon={<PrintIcon />}>
                    Exportar PDF
                </Button>
            </DialogActions>
        </Dialog>
    );
}

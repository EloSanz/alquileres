import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

export interface PentaMontReceiptModalProps {
  open: boolean;
  receiptPdfUrl: string | null;
  onClose: () => void;
}

export default function PentaMontReceiptModal({
  open,
  receiptPdfUrl,
  onClose,
}: PentaMontReceiptModalProps) {

  const handleDownload = () => {
    if (!receiptPdfUrl) return;

    // Crear un elemento <a> temporal para descargar el PDF
    const link = document.createElement('a');
    link.href = receiptPdfUrl;
    link.download = `recibo-penta-mont-${new Date().getTime()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Recibo Penta Mont</DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {receiptPdfUrl ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              mb: 2,
              minHeight: '600px',
            }}
          >
            <Box
              component="iframe"
              src={receiptPdfUrl}
              title="Recibo Penta Mont"
              sx={{
                width: '100%',
                height: '600px',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                boxShadow: 2,
              }}
            />
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            No hay recibo disponible
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button
          onClick={handleDownload}
          variant="contained"
          startIcon={<DownloadIcon />}
          disabled={!receiptPdfUrl}
        >
          Descargar PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
}


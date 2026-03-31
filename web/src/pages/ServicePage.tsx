import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Fab,
} from '@mui/material';
import { Receipt as ReceiptIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import NavigationTabs from '../components/NavigationTabs';
import ServiceReceiptModal from '../components/ServiceReceiptModal';
import UploadServiceReceiptModal from '../components/UploadServiceReceiptModal';
import ServiceReceiptsTable from '../components/ServiceReceiptsTable';

const ServicePage = () => {
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Servicios
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de recibos de servicios (Agua, Luz)
        </Typography>
      </Box>

      <NavigationTabs />

      <Box sx={{ mt: 3 }}>
        <ServiceReceiptsTable />
      </Box>

      <ServiceReceiptModal
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
      />

      <UploadServiceReceiptModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />

      <Fab
        color="secondary"
        variant="extended"
        size="large"
        aria-label="cargar comprobante de servicio"
        sx={{ position: 'fixed', bottom: 100, right: 16, px: 3, py: 1.5 }}
        onClick={() => setUploadModalOpen(true)}
      >
        <UploadIcon sx={{ mr: 1 }} />
        Cargar Recibo
      </Fab>

      <Fab
        color="primary"
        variant="extended"
        size="large"
        aria-label="nuevo recibo de servicio"
        sx={{ position: 'fixed', bottom: 32, right: 16, px: 3, py: 1.5 }}
        onClick={() => setReceiptModalOpen(true)}
      >
        <ReceiptIcon sx={{ mr: 1 }} />
        Generar Recibo
      </Fab>
    </Container>
  );
};

export default ServicePage;

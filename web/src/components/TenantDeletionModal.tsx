import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface Tenant {
  id: number;
  firstName: string;
  lastName: string;
}

interface TenantDeletionModalProps {
  open: boolean;
  tenant: Tenant | null;
  onConfirmDelete: () => Promise<void>;
  onClose: () => void;
}

const TenantDeletionModal: React.FC<TenantDeletionModalProps> = ({
  open,
  tenant,
  onConfirmDelete,
  onClose,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');

    try {
      await onConfirmDelete();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el inquilino');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Eliminar Inquilino
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography sx={{ mb: 2 }}>
          ¿Estás seguro de que quieres eliminar al inquilino{' '}
          <strong>
            {tenant?.firstName} {tenant?.lastName}
          </strong>?
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Nota importante:</strong> Los pagos históricos mantendrán la información del inquilino
            (nombre completo y teléfono) para preservar la trazabilidad, incluso después de eliminarlo.
            Las propiedades asociadas serán liberadas automáticamente.
          </Typography>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="outlined" disabled={isDeleting}>
          Cancelar
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={16} /> : null}
        >
          {isDeleting ? 'Eliminando...' : 'Eliminar Inquilino'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TenantDeletionModal;

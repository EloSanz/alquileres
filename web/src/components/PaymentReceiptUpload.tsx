import React from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    CircularProgress,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

interface PaymentReceiptUploadProps {
    imageUrl: string | null;
    isUploading: boolean;
    isAdmin: boolean;
    onImageSelect: (file: File) => void;
}

export const PaymentReceiptUpload: React.FC<PaymentReceiptUploadProps> = ({
    imageUrl,
    isUploading,
    isAdmin,
    onImageSelect,
}) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageSelect(e.target.files[0]);
        }
    };

    const displayImage = imageUrl || `${import.meta.env.BASE_URL || '/'}comprobante.png`.replace(/\/+/g, '/');

    return (
        <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Comprobante de Pago
            </Typography>
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    minHeight: '400px',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <Box
                        component="img"
                        src={displayImage}
                        alt="Comprobante"
                        sx={{
                            maxWidth: '100%',
                            maxHeight: '500px',
                            objectFit: 'contain',
                            borderRadius: 1,
                            mb: 2,
                            opacity: isUploading ? 0.5 : (imageUrl ? 1 : 0.4),
                            transition: 'opacity 0.3s',
                        }}
                    />
                    {isUploading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1,
                                zIndex: 2,
                            }}
                        >
                            <CircularProgress size={40} />
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                Subiendo imagen...
                            </Typography>
                        </Box>
                    )}
                </Box>
                {isAdmin && (
                    <Box>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="receipt-upload-input"
                            type="file"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                        <label htmlFor="receipt-upload-input">
                            <Button
                                variant="contained"
                                color="secondary"
                                component="span"
                                startIcon={<CloudUploadIcon />}
                                disabled={isUploading}
                                size="large"
                                sx={{
                                    borderRadius: 2,
                                    px: 4,
                                    textTransform: 'none',
                                    fontWeight: 600
                                }}
                            >
                                {imageUrl ? 'CAMBIAR IMAGEN' : 'SUBIR IMAGEN'}
                            </Button>
                        </label>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

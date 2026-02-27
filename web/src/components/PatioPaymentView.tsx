import { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Alert,
    Button,
    Grid,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import RoleGuard from './RoleGuard';
import { usePatioTenants } from '../hooks/usePatioTenants';
import { usePatioPayments } from '../hooks/usePatioPayments';
import { PatioTenant } from '../../../shared/types/PatioTenant';
import PatioTenantDetailsModal from './PatioTenantDetailsModal';
import PatioPaymentEditModal from './PatioPaymentEditModal';

const PatioPaymentView = () => {
    const { patioTenants, isLoading: loadingTenants, error: errorTenants } = usePatioTenants();
    const { patioPayments, isLoading: loadingPayments, error: errorPayments } = usePatioPayments();

    const [selectedTenant, setSelectedTenant] = useState<PatioTenant | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const loading = loadingTenants || loadingPayments;
    const error = errorTenants || errorPayments;

    const handleOpenDetails = (tenant: PatioTenant) => {
        setSelectedTenant(tenant);
        setIsDetailsOpen(true);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{(error as Error).message}</Alert>;
    }

    const getTenantStatus = (tenantId: number) => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-11

        // Filtrar pagos del inquilino para el año actual
        const tenantPayments = patioPayments.filter(p =>
            p.patioTenantId === tenantId &&
            new Date(p.fechaVencimiento).getUTCFullYear() === currentYear
        );

        // Mapear pagos por mes
        const paymentsByMonth: Record<number, string> = {};
        tenantPayments.forEach(p => {
            paymentsByMonth[new Date(p.fechaVencimiento).getUTCMonth()] = p.estado;
        });

        // Verificar si todos los meses hasta el actual están pagados
        let hasDebt = false;
        for (let i = 0; i <= currentMonth; i++) {
            if (paymentsByMonth[i] !== 'PAGADO') {
                hasDebt = true;
                break;
            }
        }

        return hasDebt ? 'CON_DEUDA' : 'AL_DIA';
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        🏪 Patio Amadeo
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {patioTenants.length} puestos · {patioPayments.length} pagos registrados
                    </Typography>
                </Box>
                <RoleGuard allowedRoles={['ADMIN']}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setIsCreateModalOpen(true)}
                        size="small"
                        sx={{ borderRadius: 2, px: 2 }}
                    >
                        Agregar Pago
                    </Button>
                </RoleGuard>
            </Box>

            {patioTenants.length === 0 ? (
                <Alert severity="info">No hay inquilinos del patio registrados aún.</Alert>
            ) : (
                <Grid container spacing={2}>
                    {patioTenants.map(tenant => {
                        const currentStatus = getTenantStatus(tenant.id);
                        const isAlDia = currentStatus === 'AL_DIA';

                        return (
                            <Grid item xs={12} sm={6} md={4} key={tenant.id}>
                                <Card
                                    variant="outlined"
                                    onClick={() => handleOpenDetails(tenant)}
                                    sx={{
                                        height: '100%',
                                        cursor: 'pointer',
                                        borderLeft: '4px solid',
                                        borderLeftColor: isAlDia ? 'success.main' : 'error.main',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            boxShadow: 4,
                                            transform: 'translateY(-2px)',
                                            borderColor: 'primary.main'
                                        },
                                        borderRadius: 2,
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                                                    {tenant.nombre}
                                                </Typography>
                                                {tenant.apodo && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                        "{tenant.apodo}"
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Chip
                                                label={isAlDia ? 'Al día' : 'Deuda'}
                                                color={isAlDia ? 'success' : 'error'}
                                                size="small"
                                                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                                            />
                                        </Box>

                                        <Typography variant="body2" color="text.secondary">
                                            📍 Puestos: <strong>{tenant.numerosLocales}</strong>
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            🏢 Razón: {tenant.razonSocial}
                                        </Typography>
                                        {tenant.rubro && (
                                            <Typography variant="body2" color="text.secondary">
                                                🏷️ Rubro: {tenant.rubro}
                                            </Typography>
                                        )}

                                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="caption" color="primary" fontWeight={600}>
                                                S/ {tenant.montoAlquiler?.toLocaleString()} / mes
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                                Ver detalles →
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            <PatioTenantDetailsModal
                open={isDetailsOpen}
                tenant={selectedTenant}
                onClose={() => setIsDetailsOpen(false)}
            />

            <PatioPaymentEditModal
                open={isCreateModalOpen}
                payment={null}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </Box>
    );
};

export default PatioPaymentView;

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardActionArea,
  CardContent,
} from '@mui/material';
import { useProperties } from '../hooks/useProperties';
import { useContracts } from '../hooks/useContracts';
import { Contract } from '../../../shared/types/Contract';
import { PropertyWithContract } from '../../../shared/types/PropertyWithContract';
import PaymentByPropertyDetailsModal from './PaymentByPropertyDetailsModal';

export interface PaymentByPropertyViewProps {
  // Permite abrir directamente el modal de un local específico (deep-link)
  openPropertyId?: number;
}

export default function PaymentByPropertyView({ openPropertyId }: PaymentByPropertyViewProps = {}) {
  const { properties, isLoading: propsLoading, error: propsError } = useProperties();
  const { contracts, isLoading: contractsLoading, error: contractsError } = useContracts();

  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const loading = propsLoading || contractsLoading;
  const error = (propsError as Error)?.message || (contractsError as Error)?.message || '';

  const propertiesWithContracts = useMemo(() => {
    if (!properties || !contracts) return [];

    // Filtrar solo propiedades ocupadas (con tenantId) - aunque el frontend podría deducirlo del contrato
    // La lógica original usaba property.tenantId
    const occupiedProperties = properties.filter(p => p.tenantId != null);

    // Filtrar contratos activos
    const activeContracts = contracts.filter(c => c.status === 'ACTIVE');

    // Crear un mapa de contratos por propertyId para acceso rápido
    const contractsByPropertyId = new Map<number, Contract>();
    for (const contract of activeContracts) {
      if (contract.propertyId != null) {
        // Si ya existe un contrato para esta propiedad, mantener el primero
        if (!contractsByPropertyId.has(contract.propertyId)) {
          contractsByPropertyId.set(contract.propertyId, contract);
        }
      }
    }

    // Combinar propiedades con sus contratos
    return occupiedProperties
      .map(property => {
        const contract = contractsByPropertyId.get(property.id) || null;
        return new PropertyWithContract(property, contract);
      })
      .filter(item => item.contract !== null) // Solo mostrar propiedades con contrato activo
      .sort((a, b) => {
        // Ordenar por número de local
        return (a.property.localNumber || 0) - (b.property.localNumber || 0);
      });
  }, [properties, contracts]);

  // Abrir modal por deep-link cuando se especifica un propertyId
  useEffect(() => {
    if (!openPropertyId || propertiesWithContracts.length === 0) return;
    const match = propertiesWithContracts.find(pwc => pwc.property.id === openPropertyId && pwc.contract);
    if (match?.contract) {
      setSelectedContract(match.contract);
      setDetailsModalOpen(true);
    }
  }, [openPropertyId, propertiesWithContracts]);

  const handlePropertyClick = (item: PropertyWithContract) => {
    if (item.contract) {
      setSelectedContract(item.contract);
      setDetailsModalOpen(true);
    }
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedContract(null);
  };

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : propertiesWithContracts.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No hay propiedades con contratos activos disponibles
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {propertiesWithContracts.map((item) => {
            const { property, contract } = item;

            // Prefer contract's tenant name if available (it might be fresher or historical snapshot), otherwise property's tenant
            const tenantName = contract?.tenantFullName ||
              (property.tenant
                ? `${property.tenant.firstName} ${property.tenant.lastName}`
                : `ID: ${property.tenantId}`);

            return (
              <Grid item xs={12} sm={6} md={4} key={property.id}>
                <Card
                  sx={{
                    transition: 'transform 0.2s',
                    opacity: contract ? 1 : 0.6,
                    '&:hover': {
                      transform: contract ? 'translateY(-4px)' : 'none',
                      boxShadow: contract ? 4 : 1
                    }
                  }}
                >
                  <CardActionArea
                    onClick={() => contract && handlePropertyClick(item)}
                    disabled={!contract}
                  >
                    <CardContent>
                      <Typography variant="h6" component="div" gutterBottom>
                        Local N° {property.localNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Inquilino:</strong> {tenantName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        <strong>Ubicación:</strong> {
                          property.ubicacion === 'BOULEVAR' ? 'Boulevard' :
                            property.ubicacion === 'SAN_MARTIN' ? 'San Martín' :
                              property.ubicacion === 'PATIO' ? 'Patio' :
                                property.ubicacion
                        }
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        <strong>Alquiler:</strong> S/ {(contract?.monthlyRent ?? property.monthlyRent)?.toFixed(2) || '0.00'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        <strong>TO-DO: GARANTIA:</strong> S/ {(contract?.monthlyRent ?? property.monthlyRent)?.toFixed(2) || '0.00'}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <PaymentByPropertyDetailsModal
        open={detailsModalOpen}
        contract={selectedContract}
        onClose={handleCloseDetails}
      />
    </>
  );
}

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { usePropertyService } from '../services/propertyService';
import { useContractService } from '../services/contractService';
import { Contract } from '../../../shared/types/Contract';
import { PropertyWithContract } from '../../../shared/types/PropertyWithContract';
import PaymentByPropertyDetailsModal from './PaymentByPropertyDetailsModal';

export interface PaymentByPropertyViewProps {
  // Props opcionales para futura extensión
}

export default function PaymentByPropertyView({}: PaymentByPropertyViewProps = {}) {
  const propertyService = usePropertyService();
  const contractService = useContractService();
  const [propertiesWithContracts, setPropertiesWithContracts] = useState<PropertyWithContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Cargar todas las propiedades
        const allProperties = await propertyService.getAllProperties();
        
        // Filtrar solo propiedades ocupadas (con tenantId)
        const occupiedProperties = allProperties.filter(p => p.tenantId != null);
        
        // Cargar todos los contratos activos
        const allContracts = await contractService.getAllContracts();
        const activeContracts = allContracts.filter(c => c.status === 'ACTIVE');
        
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
        const propertiesWithContractsData: PropertyWithContract[] = occupiedProperties
          .map(property => {
            const contract = contractsByPropertyId.get(property.id) || null;
            return new PropertyWithContract(property, contract);
          })
          .filter(item => item.contract !== null) // Solo mostrar propiedades con contrato activo
          .sort((a, b) => {
            // Ordenar por número de local
            return a.property.localNumber - b.property.localNumber;
          });
        
        setPropertiesWithContracts(propertiesWithContractsData);
      } catch (e: any) {
        setError(e?.message || 'Error al cargar propiedades y contratos');
        setPropertiesWithContracts([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            const tenantName = property.tenant 
              ? `${property.tenant.firstName} ${property.tenant.lastName}`
              : contract?.tenantFullName || `ID: ${property.tenantId}`;
            
            return (
              <Grid item xs={12} sm={6} md={4} key={property.id}>
                <Card
                  sx={{
                    cursor: contract ? 'pointer' : 'default',
                    transition: 'transform 0.2s',
                    opacity: contract ? 1 : 0.6,
                    '&:hover': {
                      transform: contract ? 'translateY(-4px)' : 'none',
                      boxShadow: contract ? 4 : 1
                    }
                  }}
                  onClick={() => contract && handlePropertyClick(item)}
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
                        property.ubicacion === 'BOULEVAR' ? 'Boulevar' :
                        property.ubicacion === 'SAN_MARTIN' ? 'San Martín' :
                        property.ubicacion === 'PATIO' ? 'Patio' :
                        property.ubicacion
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      <strong>Alquiler:</strong> S/ {property.monthlyRent?.toFixed(2) || '0.00'}
                    </Typography>
                  </CardContent>
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


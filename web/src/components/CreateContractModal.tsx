import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTenantService } from '../services/tenantService';
import { usePropertyService } from '../services/propertyService';
import { useContractService } from '../services/contractService';
import { CreateContract } from '../../../shared/types/Contract';
import { Tenant } from '../../../shared/types/Tenant';
import { Property } from '../../../shared/types/Property';

interface CreateContractModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateContractModal({
  open,
  onClose,
  onSuccess,
}: CreateContractModalProps) {
  const tenantService = useTenantService();
  const propertyService = usePropertyService();
  const contractService = useContractService();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    tenantId: '',
    propertyId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    monthlyRent: '',
  });

  // Cargar tenants y properties cuando se abre el modal
  useEffect(() => {
    if (open) {
      loadData();
      // Reset form
      const today = new Date();
      const defaultEndDate = new Date(today);
      defaultEndDate.setFullYear(defaultEndDate.getFullYear() + 1);
      setFormData({
        tenantId: '',
        propertyId: '',
        startDate: today.toISOString().split('T')[0],
        endDate: defaultEndDate.toISOString().split('T')[0],
        monthlyRent: '',
      });
      setError('');
    }
  }, [open]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [tenantsData, propertiesData] = await Promise.all([
        tenantService.getAllTenants(),
        propertyService.getAllProperties(),
      ]);
      setTenants(tenantsData);
      setProperties(propertiesData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  const calculateDefaultEndDate = (startDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    return end.toISOString().split('T')[0];
  };

  const handleStartDateChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      startDate: value,
      // Si endDate está vacío o es la fecha calculada anterior, actualizarla automáticamente
      endDate: prev.endDate || calculateDefaultEndDate(value),
    }));
    setError('');
  };

  const handleSubmit = async () => {
    // Validación
    if (!formData.tenantId || !formData.propertyId || !formData.startDate || !formData.endDate || !formData.monthlyRent) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    // Validar que endDate sea posterior a startDate
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    if (endDate <= startDate) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    // Validar que el inquilino tenga DNI
    const selectedTenant = tenants.find(tenant => tenant.id.toString() === formData.tenantId);
    if (!selectedTenant?.documentId || selectedTenant.documentId.trim().length < 5) {
      setError('El inquilino debe tener un DNI válido para crear un contrato');
      return;
    }

    const monthlyRentNum = parseFloat(formData.monthlyRent);
    if (isNaN(monthlyRentNum) || monthlyRentNum <= 0) {
      setError('La renta mensual debe ser un número mayor a 0');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const createContract = new CreateContract(
        parseInt(formData.tenantId),
        parseInt(formData.propertyId),
        formData.startDate,
        monthlyRentNum,
        formData.endDate
      );

      await contractService.createContract(createContract);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al crear el contrato');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agregar Nuevo Contrato</DialogTitle>
      <DialogContent>
        {loadingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <FormControl fullWidth required>
              <InputLabel>Inquilino</InputLabel>
              <Select
                value={formData.tenantId}
                label="Inquilino"
                onChange={(e) => handleChange('tenantId', e.target.value)}
              >
                {tenants.map((tenant) => (
                  <MenuItem key={tenant.id} value={tenant.id.toString()}>
                    {tenant.firstName} {tenant.lastName}
                    {tenant.localNumbers && tenant.localNumbers.length > 0 && (
                      <span style={{ color: '#666', marginLeft: '8px' }}>
                        (Locales: {tenant.localNumbers.join(', ')})
                      </span>
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Propiedad</InputLabel>
              <Select
                value={formData.propertyId}
                label="Propiedad"
                onChange={(e) => handleChange('propertyId', e.target.value)}
              >
                {properties.map((property) => (
                  <MenuItem key={property.id} value={property.id.toString()}>
                    Local N° {property.localNumber}
                    {property.tenantId && property.tenant && (
                      <span style={{ color: '#666', marginLeft: '8px' }}>
                        ({property.tenant.firstName} {property.tenant.lastName})
                      </span>
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Fecha de Inicio"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />

            <TextField
              fullWidth
              label="Fecha de Fin"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              required
              helperText={
                formData.startDate && formData.endDate
                  ? `Duración: ${Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} días`
                  : ''
              }
            />

            <TextField
              fullWidth
              label="Renta Mensual (S/)"
              type="number"
              value={formData.monthlyRent}
              onChange={(e) => handleChange('monthlyRent', e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
              required
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || loadingData}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


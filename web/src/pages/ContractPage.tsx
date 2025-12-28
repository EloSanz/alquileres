import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Fab,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { Add as AddIcon, PictureAsPdf as PdfIcon, Edit as EditIcon } from '@mui/icons-material';
import NavigationTabs from '../components/NavigationTabs';
import SearchBar from '../components/SearchBar';
import FilterBar, { type FilterConfig } from '../components/FilterBar';
import { useContractService } from '../services/contractService';
import { Contract, UpdateContract } from '../../../shared/types/Contract';
import ContractDetailsModal from '../components/ContractDetailsModal';
import ContractEditorModal from '../components/contract-editor/ContractEditorModal';
import CreateContractModal from '../components/CreateContractModal';
// Función para extraer el año de una fecha (Date o string)
const getYearFromDate = (date: Date | string | null | undefined): number | null => {
  if (!date) return null;
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return null;
  return dateObj.getFullYear();
};

// Función para formatear fecha a DD/MM/YYYY
const formatDateDisplay = (date: Date | string | null | undefined): string => {
  if (!date) return '-';
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return String(date);
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const ContractPage = () => {
  const contractService = useContractService()
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string | string[]>>({
    status: '',
    year: ''
  });
  const [editorOpen, setEditorOpen] = useState(false);
  const [createContractOpen, setCreateContractOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [editForm, setEditForm] = useState({
    monthlyRent: '',
  });

  // Helper para traducir estados a español
  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'ACTIVE': 'Activo',
      'COMPLETED': 'Completado',
      'CANCELLED': 'Cancelado',
      'TERMINATED': 'Terminado'
    };
    return labels[status] || status;
  };

  // Obtener años únicos de los contratos para el filtro
  const availableYears = Array.from(
    new Set(
      contracts
        .map(c => getYearFromDate(c.startDate))
        .filter((year): year is number => year !== null)
    )
  ).sort((a, b) => b - a); // Ordenar de mayor a menor

  const contractFilters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Estado',
      options: [
        { value: 'ACTIVE', label: 'Activo' },
        { value: 'COMPLETED', label: 'Completado' },
        { value: 'CANCELLED', label: 'Cancelado' },
        { value: 'TERMINATED', label: 'Terminado' }
      ]
    },
    {
      key: 'year',
      label: 'Año',
      options: availableYears.map(year => ({
        value: year.toString(),
        label: year.toString()
      }))
    }
  ];

  const filterContracts = (query: string, filters: Record<string, string | string[]>, contractsList: Contract[]) => {
    return contractsList.filter(contract => {
      // Filtro de búsqueda por texto
      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
          const matchesQuery =
          contract.id.toString().includes(lowerQuery) ||
          (contract.tenantId?.toString() || '').includes(lowerQuery) ||
          (contract.propertyId?.toString() || '').includes(lowerQuery) ||
          contract.tenantFullName?.toLowerCase().includes(lowerQuery) ||
          contract.propertyName?.toLowerCase().includes(lowerQuery) ||
          contract.monthlyRent.toString().includes(lowerQuery) ||
          contract.status.toLowerCase().includes(lowerQuery);

        if (!matchesQuery) return false;
      }

      // Filtro por estado
      if (filters.status && contract.status !== filters.status) {
        return false;
      }

      // Filtro por año
      if (filters.year) {
        const contractYear = getYearFromDate(contract.startDate);
        if (contractYear === null || contractYear.toString() !== filters.year) {
          return false;
        }
      }

      return true;
    });
  };

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await contractService.getAllContracts();
      setContracts(data);
      const filtered = filterContracts(searchQuery, filterValues, data);
      setFilteredContracts(filtered);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contracts');
      setContracts([]);
      setFilteredContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    const filtered = filterContracts(query, filterValues, contracts);
    setFilteredContracts(filtered);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    const filtered = filterContracts('', filterValues, contracts);
    setFilteredContracts(filtered);
  };

  const handleFilterChange = (key: string, value: string | string[]) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    const filtered = filterContracts(searchQuery, newFilters, contracts);
    setFilteredContracts(filtered);
  };

  const handleClearFilters = () => {
    const newFilters = { status: '', year: '' };
    setFilterValues(newFilters);
    const filtered = filterContracts(searchQuery, newFilters, contracts);
    setFilteredContracts(filtered);
  };

  const hasFetchedRef = useRef(false);
  
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchContracts();
  }, []);

  const handleRowClick = (contract: Contract) => {
    setSelectedContract(contract);
    setDetailsOpen(true);
  };

  const handleCreateContractSuccess = () => {
    setCreateContractOpen(false);
    fetchContracts();
  };

  const handleEdit = (contract: Contract, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setEditingContract(contract);
    setEditForm({
      monthlyRent: contract.monthlyRent?.toString() || '',
    });
    setEditDialogOpen(true);
  };

  const handleUpdateContract = async () => {
    if (!editingContract) return;

    try {
      const monthlyRent = parseFloat(editForm.monthlyRent);
      if (isNaN(monthlyRent) || monthlyRent <= 0) {
        setError('El alquiler mensual debe ser un número mayor a cero');
        return;
      }

      const updateData = new UpdateContract(
        undefined, // tenantId
        undefined, // propertyId
        undefined, // startDate
        monthlyRent, // monthlyRent
        undefined  // status
      );

      await contractService.updateContract(editingContract.id, updateData);
      setEditDialogOpen(false);
      setEditingContract(null);
      setEditForm({ monthlyRent: '' });
      fetchContracts(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to update contract');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: { xs: 'block', sm: 'flex' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: 2 
        }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Contratos
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 250 }, maxWidth: { xs: '100%', sm: 400 } }}>
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onClearSearch={handleClearSearch}
              placeholder="Buscar por inquilino, propiedad, estado..."
              label="Buscar contratos"
            />
          </Box>
          <FilterBar
            filters={contractFilters}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </Box>
      </Box>

      {/* Navigation Menu - Siempre visible */}
      <NavigationTabs />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Inquilino</strong></TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><strong>Local / N°</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><strong>Fecha Inicio</strong></TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><strong>Fecha Fin</strong></TableCell>
                <TableCell><strong>Alquiler Mensual</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      {contracts.length === 0
                        ? 'No hay contratos registrados'
                        : 'No se encontraron contratos con los filtros aplicados'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContracts.map((contract) => (
                  <TableRow
                    key={contract.id}
                    hover
                    onClick={() => handleRowClick(contract)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.12)'
                      }
                    }}
                  >
                    <TableCell>
                      {contract.tenantFullName || `ID: ${contract.tenantId}`}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      N° {contract.propertyLocalNumber || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(contract.status)}
                        color={
                          contract.status === 'ACTIVE'
                            ? 'success'
                            : contract.status === 'COMPLETED'
                            ? 'default'
                            : contract.status === 'CANCELLED'
                            ? 'error'
                            : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {formatDateDisplay(contract.startDate)}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {formatDateDisplay(contract.endDate)}
                    </TableCell>
                    <TableCell>
                      S/ {contract.monthlyRent?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleEdit(contract, e)}
                        title="Editar Alquiler Mensual"
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <ContractDetailsModal
        open={detailsOpen}
        contract={selectedContract}
        onClose={() => setDetailsOpen(false)}
      />

      {/* Editor Modal para PDF */}
      <ContractEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
      />

      {/* Modal para crear contrato */}
      <CreateContractModal
        open={createContractOpen}
        onClose={() => setCreateContractOpen(false)}
        onSuccess={handleCreateContractSuccess}
      />

      {/* Edit Contract Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Alquiler Mensual</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Alquiler Mensual (S/)"
              type="number"
              value={editForm.monthlyRent}
              onChange={(e) => setEditForm({ ...editForm, monthlyRent: e.target.value })}
              required
              inputProps={{ min: 0, step: 0.01 }}
              helperText="Ingrese el nuevo monto del alquiler mensual"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditDialogOpen(false);
            setEditingContract(null);
            setEditForm({ monthlyRent: '' });
          }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateContract} 
            variant="contained"
            disabled={!editForm.monthlyRent || parseFloat(editForm.monthlyRent) <= 0}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* FAB para generar PDF */}
      <Tooltip title="Generar contrato PDF" placement="left">
        <Fab
          color="secondary"
          variant="extended"
          size="large"
          aria-label="generar pdf"
          onClick={() => setEditorOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            px: 3,
            py: 1.5
          }}
        >
          <PdfIcon sx={{ mr: 1 }} />
          Generar PDF
        </Fab>
      </Tooltip>

      {/* FAB para agregar contrato */}
      <Tooltip title="Agregar nuevo contrato" placement="left">
        <Fab
          color="primary"
          variant="extended"
          size="large"
          aria-label="agregar contrato"
          onClick={() => setCreateContractOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 112,
            right: 32,
            px: 3,
            py: 1.5
          }}
        >
          <AddIcon sx={{ mr: 1 }} />
          Agregar Contrato
        </Fab>
      </Tooltip>
    </Container>
  );
};

export default ContractPage;


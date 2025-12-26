import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import NavigationTabs from '../components/NavigationTabs';
import SearchBar from '../components/SearchBar';
import FilterBar, { type FilterConfig } from '../components/FilterBar';
import { useContractService, type Contract } from '../services/contractService';
import ContractDetailsModal from '../components/ContractDetailsModal';
import ContractEditorModal from '../components/contract-editor/ContractEditorModal';

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
    status: ''
  });
  const [editorOpen, setEditorOpen] = useState(false);

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
          contract.status.toLowerCase().includes(lowerQuery) ||
          new Date(contract.startDate).toLocaleDateString('es-ES').toLowerCase().includes(lowerQuery) ||
          new Date(contract.endDate).toLocaleDateString('es-ES').toLowerCase().includes(lowerQuery);

        if (!matchesQuery) return false;
      }

      // Filtro por estado
      if (filters.status && contract.status !== filters.status) {
        return false;
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
    const newFilters = { status: '' };
    setFilterValues(newFilters);
    const filtered = filterContracts(searchQuery, newFilters, contracts);
    setFilteredContracts(filtered);
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleRowClick = (contract: Contract) => {
    setSelectedContract(contract);
    setDetailsOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Contratos
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, maxWidth: 400 }}>
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onClearSearch={handleClearSearch}
              placeholder="Buscar por ID, inquilino, propiedad, estado..."
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
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Inquilino</strong></TableCell>
                <TableCell><strong>Local / N°</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell><strong>Fecha Inicio</strong></TableCell>
                <TableCell><strong>Fecha Fin</strong></TableCell>
                <TableCell><strong>Alquiler Mensual</strong></TableCell>
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
                    <TableCell>{contract.id}</TableCell>
                    <TableCell>
                      {contract.tenantFullName || `ID: ${contract.tenantId}`}
                    </TableCell>
                    <TableCell>
                      {contract.propertyName || `ID: ${contract.propertyId}`}
                      {contract.propertyLocalNumber !== undefined && (
                        <Box component="span" sx={{ color: 'text.secondary', ml: 1 }}>
                          / N° {contract.propertyLocalNumber}
                        </Box>
                      )}
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
                    <TableCell>
                      {contract.startDate
                        ? new Date(contract.startDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {contract.endDate
                        ? new Date(contract.endDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      S/ {contract.monthlyRent?.toFixed(2) || '0.00'}
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

      {/* Editor Modal */}
      <ContractEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
      />

      {/* FAB para crear nuevo contrato */}
      <Tooltip title="Generar nuevo contrato" placement="left">
        <Fab
          color="primary"
          variant="extended"
          size="large"
          aria-label="generar contrato"
          onClick={() => setEditorOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 32,
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


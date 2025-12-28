import { useMemo } from 'react';
import { useApi } from '../contexts/ApiContext';
import { DataGateway } from './DataGateway';

// Singleton instance del DataGateway
let gatewayInstance: DataGateway | null = null;

export const useDataGateway = (): DataGateway => {
  const api = useApi();
  
  // Crear instancia única del gateway
  const gateway = useMemo(() => {
    if (!gatewayInstance) {
      gatewayInstance = new DataGateway(api);
    }
    return gatewayInstance;
  }, [api]);

  return gateway;
};


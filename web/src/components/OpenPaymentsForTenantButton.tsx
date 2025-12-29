import { Button, type ButtonProps } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export interface OpenPaymentsForTenantButtonProps {
  tenantId?: number;
  propertyId?: number;
  localNumber?: number;
  variant?: ButtonProps['variant'];
  color?: ButtonProps['color'];
  size?: ButtonProps['size'];
  fullWidth?: boolean;
  sx?: ButtonProps['sx'];
}

export default function OpenPaymentsForTenantButton({
  tenantId,
  propertyId,
  localNumber,
  variant = 'outlined',
  fullWidth = false,
  color = 'primary',
  size = 'medium',
  sx,
}: OpenPaymentsForTenantButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    const params = new URLSearchParams();
    params.set('openModal', 'local');
    if (tenantId) params.set('tenantId', String(tenantId));
    if (propertyId) params.set('propertyId', String(propertyId));
    if (localNumber) params.set('local', String(localNumber));
    navigate(`/payments?${params.toString()}`);
  };

  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      onClick={handleClick}
      fullWidth={fullWidth}
      sx={sx}
    >
      Editar pagos
    </Button>
  );
}



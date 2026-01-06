import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: ('ADMIN' | 'READ_ONLY')[];
    fallback?: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({
    children,
    allowedRoles,
    fallback = null
}) => {
    const { hasRole } = useAuth();

    if (!hasRole(allowedRoles)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export default RoleGuard;

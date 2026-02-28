import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredGroups?: ('client' | 'service_company' | 'manager' | 'superadmin')[];
}

export default function ProtectedRoute({ children, requiredGroups }: ProtectedRouteProps) {
  const { isAuthenticated, userGroup, loading } = useAuth();

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredGroups && !requiredGroups.includes(userGroup!)) {
    if (userGroup === 'client' || userGroup === 'service_company') {
      return <Navigate to="/machine-list" replace />;
    }
    // В остальных случаях — на дашборд
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

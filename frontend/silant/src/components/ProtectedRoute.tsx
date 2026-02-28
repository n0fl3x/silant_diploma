import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({
  children
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    setLocalLoading(false);
  }, []);

  if (loading || localLoading) {
    return <div>Проверка авторизации...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

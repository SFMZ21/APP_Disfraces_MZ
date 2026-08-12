import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { PageState } from "../../shared/components/PageState";

export function ProtectedRoute({ children, isAdminRequired = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageState>Cargando sesión…</PageState>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isAdminRequired && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

export function ProtectedRoute({ children, isAdminRequired = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="page-status" role="status">Cargando sesión…</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isAdminRequired && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

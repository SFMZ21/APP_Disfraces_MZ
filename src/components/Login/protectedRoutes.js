import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

export function ProtectedRoute({ children, isAdminRequired }) {
  const { user, loading } = useAuth();

  if (loading) return <h1>Loading</h1>;

  if (!user) return <Navigate to="/login" />;
  
  
  if(isAdminRequired && !user.isAdmin){
    return <Navigate to="/"/>
  } 
  return <>{children}</>;
}
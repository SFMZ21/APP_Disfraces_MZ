import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  registerWithEmail,
  subscribeToAuthentication,
} from "../features/auth/api/authApi";
import { USER_ROLES } from "../shared/domain/roles";

export const authContext = createContext(null);

export function useAuth() {
  const context = useContext(authContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider.");
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => subscribeToAuthentication(
    (authenticatedUser) => {
      setUser(authenticatedUser);
      setLoading(false);
    },
    (error, firebaseUser) => {
      console.error("No fue posible cargar el perfil del usuario:", error);
      setUser({
        uid: firebaseUser?.uid ?? "",
        email: firebaseUser?.email ?? "",
        displayName: firebaseUser?.displayName ?? "",
        role: USER_ROLES.USER,
        isAdmin: false,
      });
      setLoading(false);
    },
  ), []);

  const value = useMemo(() => ({
    user,
    loading,
    login: (email, password) => loginWithEmail({ email, password }),
    registro: (email, password) => registerWithEmail({ email, password }),
    logInGoogle: loginWithGoogle,
    logOut: logoutUser,
  }), [loading, user]);

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
}

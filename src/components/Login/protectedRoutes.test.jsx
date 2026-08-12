import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { authContext } from "../../context/authContext";
import { ProtectedRoute } from "./protectedRoutes";

function renderRoutes(authValue, adminRequired = false, initialPath = "/private") {
  return render(
    <authContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/" element={<p>Inicio</p>} />
          <Route path="/login" element={<p>Login</p>} />
          <Route
            path="/private"
            element={(
              <ProtectedRoute isAdminRequired={adminRequired}>
                <p>Contenido privado</p>
              </ProtectedRoute>
            )}
          />
        </Routes>
      </MemoryRouter>
    </authContext.Provider>,
  );
}

describe("ProtectedRoute", () => {
  it("muestra loading mientras Firebase recupera la sesión", () => {
    renderRoutes({ user: null, loading: true });
    expect(screen.getByRole("status")).toHaveTextContent("Cargando sesión");
  });

  it("redirige al login cuando no hay usuario", () => {
    renderRoutes({ user: null, loading: false });
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("permite una ruta protegida al usuario normal", () => {
    renderRoutes({ user: { uid: "user", isAdmin: false }, loading: false });
    expect(screen.getByText("Contenido privado")).toBeInTheDocument();
  });

  it("redirige al inicio cuando la ruta exige administración", () => {
    renderRoutes({ user: { uid: "user", isAdmin: false }, loading: false }, true);
    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });

  it("permite una ruta administrativa al administrador", () => {
    renderRoutes({ user: { uid: "admin", isAdmin: true }, loading: false }, true);
    expect(screen.getByText("Contenido privado")).toBeInTheDocument();
  });
});

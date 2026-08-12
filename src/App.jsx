import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar/navbar";
import { Carrito } from "./components/Carrito/carrito";
import { ProtectedRoute } from "./components/Login/protectedRoutes";
import { AuthProvider } from "./context/authContext";
import { DataProvider } from "./context/DataProvider";
import { PurchaseTimeProvider } from "./context/purchaseTimeContext";

const Login = lazy(() =>
  import("./components/Login/login").then((module) => ({ default: module.Login })),
);
const Register = lazy(() =>
  import("./components/Login/register").then((module) => ({
    default: module.Register,
  })),
);
const Inicio = lazy(() =>
  import("./components/Inicio/inicio").then((module) => ({
    default: module.Inicio,
  })),
);
const ListaProductos = lazy(() =>
  import("./components/Productos/productos").then((module) => ({
    default: module.ListaProductos,
  })),
);
const ProductoCatalogo = lazy(() =>
  import("./components/Productos/productoCatalogo").then((module) => ({
    default: module.ProductoCatalogo,
  })),
);
const AdminPanel = lazy(() =>
  import("./components/Admin/adminPanel").then((module) => ({
    default: module.AdminPanel,
  })),
);
const PedidosAdmin = lazy(() =>
  import("./components/Admin/pedidosAdmin").then((module) => ({
    default: module.PedidosAdmin,
  })),
);
const Inventario = lazy(() =>
  import("./components/Admin/inventario").then((module) => ({
    default: module.Inventario,
  })),
);

function AppShell({ children }) {
  return (
    <ProtectedRoute>
      <Navbar />
      <Carrito />
      {children}
    </ProtectedRoute>
  );
}

function AdminShell({ children }) {
  return (
    <ProtectedRoute isAdminRequired>
      <Navbar />
      <Carrito />
      {children}
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <PurchaseTimeProvider>
          <div className="App">
            <Suspense fallback={<p className="page-status">Cargando…</p>}>
              <Routes>
                <Route path="/" element={<AppShell><Inicio /></AppShell>} />
                <Route
                  path="/productos"
                  element={<AppShell><ListaProductos /></AppShell>}
                />
                <Route
                  path="/productos/:id"
                  element={<AppShell><ProductoCatalogo /></AppShell>}
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/adminPanel"
                  element={<AdminShell><AdminPanel /></AdminShell>}
                />
                <Route
                  path="/adminPanel/pedidosAdmin"
                  element={<AdminShell><PedidosAdmin /></AdminShell>}
                />
                <Route
                  path="/adminPanel/inventario"
                  element={<AdminShell><Inventario /></AdminShell>}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </PurchaseTimeProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;

import { useEffect, useState } from "react";
import { Menu, ShoppingCart, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../../images/LogoHeader6.svg";
import { useAuth } from "../../context/authContext";
import { useCart } from "../../features/cart/context/CartContext";

export function Navbar() {
  const { isOpen, setIsOpen, items } = useCart();
  const { logOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [navigationOpen, setNavigationOpen] = useState(false);

  useEffect(() => {
    setNavigationOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("No fue posible cerrar la sesión:", error);
    }
  };

  return (
    <nav className="navbar" aria-label="Navegación principal">
      <div className="navbar-inner">
        <Link className="brand-link" to="/" aria-label="Ir al inicio">
          <div className="logo">
            <img src={Logo} alt="Disfraces MZ" />
          </div>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          onClick={() => setNavigationOpen((current) => !current)}
          aria-label={navigationOpen ? "Cerrar navegación" : "Abrir navegación"}
          aria-controls="main-navigation"
          aria-expanded={navigationOpen}
        >
          {navigationOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>

        <div
          id="main-navigation"
          className={navigationOpen ? "nav-content is-open" : "nav-content"}
        >
          <ul>
            <li>
              <Link to="/" onClick={() => setNavigationOpen(false)}>Inicio</Link>
            </li>
            <li>
              <Link to="/productos" onClick={() => setNavigationOpen(false)}>
                Productos
              </Link>
            </li>
            {user?.isAdmin && (
              <li>
                <Link to="/adminPanel" onClick={() => setNavigationOpen(false)}>
                  Administración
                </Link>
              </li>
            )}
          </ul>

          <div className="user-actions">
            <span className="username" title={user?.displayName || user?.email}>
              {user?.displayName || user?.email}
            </span>
            <button type="button" className="logOut-btn" onClick={handleLogout}>
              Cerrar sesión
            </button>
            <button
              type="button"
              className="cart"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={`Abrir carrito con ${items.length} productos`}
              aria-expanded={isOpen}
            >
              <ShoppingCart aria-hidden="true" />
              <span className="item_total">{items.length}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

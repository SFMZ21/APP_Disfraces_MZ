import { ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../images/LogoHeader6.svg";
import { useAuth } from "../../context/authContext";
import { useStore } from "../../context/DataProvider";

export function Navbar() {
  const { menu, setMenu, carrito } = useStore();
  const { logOut, user } = useAuth();
  const navigate = useNavigate();

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
      <Link to="/" aria-label="Ir al inicio">
        <div className="logo">
          <img src={Logo} alt="Disfraces MZ" width="300" />
        </div>
      </Link>
      <ul>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/productos">Productos</Link></li>
        {user?.isAdmin && (
          <li><Link to="/adminPanel">Administración</Link></li>
        )}
      </ul>
      <div className="user">
        <span className="username">{user?.displayName || user?.email}</span>
      </div>
      <button type="button" className="logOut-btn" onClick={handleLogout}>
        Cerrar sesión
      </button>
      <button
        type="button"
        className="cart"
        onClick={() => setMenu(!menu)}
        aria-label={`Abrir carrito con ${carrito.length} productos`}
        aria-expanded={menu}
      >
        <ShoppingCart aria-hidden="true" />
        <span className="item_total">{carrito.length}</span>
      </button>
    </nav>
  );
}

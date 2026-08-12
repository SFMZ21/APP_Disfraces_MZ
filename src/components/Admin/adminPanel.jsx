import { useState } from "react";
import { ProductoNuevo } from "../Productos/productoNuevo";
import { Link } from "react-router-dom";
import Logo from "../../images/addDisfraz.png";
import Logo2 from "../../images/VerPedidos.png";
import Logo3 from "../../images/inventario.png";

export const AdminPanel = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <main className="admin-page">
      <h1>Administración</h1>
      <div className="admin-panel">
        <section className="admin-card">
          <img src={Logo} alt="" />
          <h2>Catálogo</h2>
          <button type="button" className="admin-action" onClick={openModal}>
            Agregar disfraz
          </button>
        </section>

        <section className="admin-card">
          <img src={Logo2} alt="" />
          <h2>Reservas</h2>
          <Link to="/adminPanel/pedidosAdmin" className="admin-action">
            Ver pedidos
          </Link>
        </section>

        <section className="admin-card">
          <img src={Logo3} alt="" />
          <h2>Existencias</h2>
          <Link to="/adminPanel/inventario" className="admin-action">
            Inventario
          </Link>
        </section>
      </div>

      {isModalOpen && (
        <ProductoNuevo onClose={closeModal} />
      )}
    </main>
  );
};

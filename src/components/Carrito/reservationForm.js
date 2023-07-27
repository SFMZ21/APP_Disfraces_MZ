import React, { useState, useContext } from "react";
import { authContext, useAuth } from "../../context/authContext";
import { DataContext } from "../../context/DataProvider";

const ReservationForm = ({ onClose }) => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");

  const contextData = useContext(authContext);
  const carritoData =useContext(DataContext);
  console.log(contextData.user);
  console.log(carritoData.carrito);
  

  const handleSubmit = (event) => {
    event.preventDefault();
    // Lógica de reserva...
    // Limpiar campos...
    setNombre("");
    setApellido("");
    setTelefono("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        <h2>Formulario de Reserva</h2>

        <form onSubmit={handleSubmit}>
          {/* Campos del formulario como antes */}
          {/* ... */}
            <div>
                <label htmlFor="nombre">Nombre:</label>
                <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                />
            </div>

            <div>
                <label htmlFor="apellido">Apellido:</label>
                <input
                type="text"
                id="apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
                />
            </div>

            <div>
                <label htmlFor="telefono">Teléfono:</label>
                <input
                type="tel"
                id="telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
                />
            </div>
          <button type="submit">Confirmar reserva</button>
        </form>
      </div>
    </div>
  );
};

export default ReservationForm;

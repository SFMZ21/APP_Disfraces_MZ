import React, { useState, useContext } from "react";
import { collection, addDoc,query, where, getDocs,doc, updateDoc, increment, FieldValue  } from "firebase/firestore";
import { firestore } from "../../firebase";
import { authContext, useAuth } from "../../context/authContext";
import { DataContext } from "../../context/DataProvider";

const ReservationForm = ({ onClose }) => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const estado = "en Alquiler";

  const contextData = useContext(authContext);
  const carritoData =useContext(DataContext);

  const [startDate] = carritoData.startDate;
  const [endDate] = carritoData.endDate;

  const [total] =carritoData.total;
  const [carrito, setCarrito]=carritoData.carrito;
  const email = contextData.user.email;
  
  
  console.log(contextData.user.email);
  console.log(carrito);
  console.log(total)
  console.log(startDate);
  console.log(endDate);
  

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Crear un objeto con los datos de la reserva
      const reserva = {
        nombre,
        apellido,
        telefono,
        estado,
        email,
        carrito,
        total,
        startDate,
        endDate,
      };

      // Guardar la reserva en la colección "pedidos"
      await addDoc(collection(firestore,"pedidos"),{
        reserva,
      });

      carrito.map( (producto) => {
        console.log(producto,'producto');
        const docRef = doc(firestore, "products", producto.id.toString());
          updateDoc(docRef, {
          enStock: increment(-producto.cantidad),
          enUso: increment(producto.cantidad),
        });
      });
  
      // Limpiar el carrito
      setCarrito([]);

      // Limpiar campos
      setNombre("");
      setApellido("");
      setTelefono("");

      // Cerrar el formulario modal
      onClose();
      // Actualizar la página después de un breve retardo
      setTimeout(() => {
        window.location.reload();
      }, 500); // Esperar 500ms antes de recargar la página

    } catch (error) {
      console.error("Error al guardar la reserva:", error);
      // Mostrar mensaje de error si es necesario
    }
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
          <button type="submit" onChange={handleSubmit}>Confirmar reserva</button>
        </form>
      </div>
    </div>
  );
};

export default ReservationForm;

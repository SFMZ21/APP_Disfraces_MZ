import React, { useState, useContext,useEffect } from "react";
import { collection, addDoc,query, where, getDocs,doc, updateDoc, increment, FieldValue  } from "firebase/firestore";
import { firestore } from "../../firebase";
import { authContext, useAuth } from "../../context/authContext";
import { DataContext } from "../../context/DataProvider";
import swal from "sweetalert";

const ReservationForm = ({ onClose }) => {

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const estado = "en Proceso";

  const contextData = useContext(authContext);
  const carritoData =useContext(DataContext);

  const [startDate] = carritoData.startDate;
  const [endDate] = carritoData.endDate;

  const [total] =carritoData.total;
  const [carrito, setCarrito]=carritoData.carrito;
  const email = contextData.user.email;
  

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
      
      swal({
        title:"¡Reserva realizada con éxito!",
        text: "Puedes pasar a recoger tu pedido a la tienda",
        icon: "success",
        button: "Aceptar"
      });
  
      // Limpiar el carrito
      setCarrito([]);

      // Limpiar campos
      setNombre("");
      setApellido("");
      setTelefono("");

      // Cerrar el formulario modal
      onClose();
      setTimeout(() => {
        window.location.reload();
      }, 5000); 

     

    } catch (error) {
      console.error("Error al guardar la reserva:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button onClick={onClose}>
          <box-icon name='x' color='#bf2a1b' ></box-icon>
        </button>

        <h2>Ficha de entrega</h2>

        <form onSubmit={handleSubmit}>
          {/* Campos del formulario como antes */}
          {/* ... */}
            <div>
                <label htmlFor="nombre">Nombre:</label>
                <input
                type="text"
                className="inputFormR"
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
                className="inputFormR"
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
                className="inputFormR"
                id="telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
                />
            </div>
          <button type="submit" className="btn-confirmar" onChange={handleSubmit}>Confirmar reserva</button>
        </form>

      </div>
    </div>
  );
};

export default ReservationForm;

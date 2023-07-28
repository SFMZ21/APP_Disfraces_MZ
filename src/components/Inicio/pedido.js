import React from "react";

const Pedido = ({ reserva }) => {
  const { nombre, apellido, telefono, email, estado, carrito, total, startDate, endDate } = reserva;

  return (
    <div className="pedido">
      <h2>Detalles del Pedido</h2>
      <p><strong>Nombre:</strong> {nombre}</p>
      <p><strong>Apellido:</strong> {apellido}</p>
      <p><strong>Teléfono:</strong> {telefono}</p>
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Estado:</strong> {estado}</p>
      <p><strong>Total:</strong> Q{total}</p>
      <p><strong>Fecha de inicio:</strong> {startDate.toDate().toLocaleDateString("es")}</p>
      <p><strong>Fecha de fin:</strong> {endDate.toDate().toLocaleDateString("es")}</p>

      <h3>Productos en el Carrito:</h3>
      <ul>
        {carrito.map((producto, index) => (
          <li key={index}>
            <p><strong>Producto:</strong> {producto.title}</p>
            <p><strong>Cantidad:</strong> {producto.cantidad}</p>
            <p><strong>Precio:</strong> Q{producto.price}</p>
            <p><strong>Talla:</strong> {producto.size}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Pedido;

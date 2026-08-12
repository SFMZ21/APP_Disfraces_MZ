function formatDate(value) {
  const date = value?.toDate?.() ?? (value ? new Date(value) : null);
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString("es-GT")
    : "Sin fecha";
}

export default function Pedido({ reserva }) {
  if (!reserva) return null;

  const {
    nombre,
    apellido,
    telefono,
    email,
    estado,
    carrito = [],
    total,
    startDate,
    endDate,
  } = reserva;

  return (
    <article className="pedido">
      <h3>Detalles del pedido</h3>
      <p><strong>Nombre:</strong> {nombre} {apellido}</p>
      <p><strong>Teléfono:</strong> {telefono}</p>
      <p><strong>Correo:</strong> {email}</p>
      <p><strong>Estado:</strong> {estado}</p>
      <p><strong>Total:</strong> Q{total}</p>
      <p><strong>Fecha de inicio:</strong> {formatDate(startDate)}</p>
      <p><strong>Fecha de fin:</strong> {formatDate(endDate)}</p>

      <h4>Productos</h4>
      <ul>
        {carrito.map((producto) => (
          <li key={producto.documentId ?? producto.id}>
            {producto.title} — {producto.cantidad} × Q{producto.price}
          </li>
        ))}
      </ul>
    </article>
  );
}

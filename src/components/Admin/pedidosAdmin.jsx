import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import swal from "sweetalert";
import { firestore } from "../../firebase";
import { updatePedidoStatus } from "../../firebaseUtils";

function toDate(value) {
  return value?.toDate?.() ?? (value ? new Date(value) : null);
}

export function PedidosAdmin() {
  const [reservas, setReservas] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestore, "pedidos"),
      (snapshot) => {
        setReservas(
          snapshot.docs.map((order) => ({
            id: order.id,
            ...order.data().reserva,
            startDate: toDate(order.data().reserva?.startDate),
            endDate: toDate(order.data().reserva?.endDate),
          })),
        );
        setError("");
      },
      (snapshotError) => {
        console.error("No fue posible cargar los pedidos:", snapshotError);
        setError("No fue posible cargar los pedidos.");
      },
    );

    return unsubscribe;
  }, []);

  const filteredReservations = useMemo(() => {
    const normalizedFilter = filtroNombre.trim().toLocaleLowerCase("es");
    if (!normalizedFilter) return reservas;

    return reservas.filter((reservation) =>
      `${reservation.nombre ?? ""} ${reservation.apellido ?? ""}`
        .toLocaleLowerCase("es")
        .includes(normalizedFilter),
    );
  }, [filtroNombre, reservas]);

  const handleStatusUpdate = async (reservation, status) => {
    setUpdatingOrderId(reservation.id);

    try {
      await updatePedidoStatus(reservation.id, status);
      await swal({ title: "Pedido actualizado.", icon: "success" });
    } catch (updateError) {
      console.error("No fue posible actualizar el pedido:", updateError);
      await swal({
        title: "No fue posible actualizar el pedido.",
        text: updateError.message,
        icon: "error",
      });
    } finally {
      setUpdatingOrderId("");
    }
  };

  return (
    <main className="table-container">
      <h1>Pedidos</h1>
      <label htmlFor="order-search" className="sr-only">Buscar por cliente</label>
      <input
        id="order-search"
        className="buscador"
        type="search"
        placeholder="Buscar por nombre del cliente"
        value={filtroNombre}
        onChange={(event) => setFiltroNombre(event.target.value)}
      />
      {error && <p className="error-message" role="alert">{error}</p>}

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Total</th>
              <th>Productos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map((reservation) => {
              const isUpdating = updatingOrderId === reservation.id;

              return (
                <tr key={reservation.id}>
                  <td data-label="Cliente">{reservation.nombre} {reservation.apellido}</td>
                  <td data-label="Correo">{reservation.email}</td>
                  <td data-label="Teléfono">{reservation.telefono}</td>
                  <td data-label="Estado">{reservation.estado}</td>
                  <td data-label="Inicio">{reservation.startDate?.toLocaleDateString("es-GT") ?? "—"}</td>
                  <td data-label="Fin">{reservation.endDate?.toLocaleDateString("es-GT") ?? "—"}</td>
                  <td data-label="Total">Q{reservation.total}</td>
                  <td data-label="Productos">
                    <ul>
                      {(reservation.carrito ?? []).map((item) => (
                        <li key={item.documentId ?? item.id}>
                          {item.cantidad} × {item.title}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td data-label="Acciones" className="order-actions">
                    {reservation.estado === "en Proceso" && (
                      <button
                        type="button"
                        className="btn-alquiler"
                        disabled={isUpdating}
                        onClick={() => handleStatusUpdate(reservation, "en Alquiler")}
                      >
                        Alquilar
                      </button>
                    )}
                    {reservation.estado === "en Alquiler" && (
                      <button
                        type="button"
                        className="btn-completado"
                        disabled={isUpdating}
                        onClick={() => handleStatusUpdate(reservation, "completado")}
                      >
                        Completar
                      </button>
                    )}
                    {["en Proceso", "en Alquiler"].includes(reservation.estado) && (
                      <button
                        type="button"
                        className="btn-cancelar"
                        disabled={isUpdating}
                        onClick={() => handleStatusUpdate(reservation, "cancelado")}
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

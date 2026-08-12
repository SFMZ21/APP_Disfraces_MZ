import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { subscribeUserOrders } from "../../features/reservations/api/reservationsApi";
import Pedido from "./pedido";

export default function PedidosByUser() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return undefined;

    const unsubscribe = subscribeUserOrders(
      user,
      (orders) => {
        setPedidos(orders);
        setError("");
        setLoading(false);
      },
      (subscriptionError) => {
        console.error(subscriptionError);
        setError(subscriptionError.userMessage || "No fue posible cargar tus pedidos.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  return (
    <section className="pedidos-container" aria-labelledby="user-orders-title">
      <h2 id="user-orders-title">Tus pedidos</h2>
      {loading && <p role="status">Cargando pedidos…</p>}
      {error && <p className="error-message" role="alert">{error}</p>}
      {!loading && !error && pedidos.length === 0 && (
        <p>Aún no tienes pedidos.</p>
      )}
      {pedidos.map((pedido) => (
        <Pedido key={pedido.id} reserva={pedido.reserva} />
      ))}
    </section>
  );
}

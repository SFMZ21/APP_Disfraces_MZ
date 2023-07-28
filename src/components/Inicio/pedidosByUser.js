import React, { useState, useEffect, useContext } from "react";
import { authContext } from "../../context/authContext";
import { getPedidosByUserEmail } from "../../firebaseUtils"; // o el path correcto del archivo
import Pedido from "../Inicio/pedido";


const PedidosByUser = () => {
  const contextData = useContext(authContext);
  const [pedidos, setPedidos] = useState([]);
  const email = contextData.user.email;

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const email = contextData.user.email;
        const pedidos = await getPedidosByUserEmail(email);
        setPedidos(pedidos);
      } catch (error) {
        console.error("Error al obtener los pedidos:", error);
      }
    };

    fetchPedidos();
  }, [contextData.user.email]);

  return (
    <div className="pedidos-container">
      <h1>Tus Pedidos</h1>
      {pedidos.map((pedido, index) => (
        <Pedido key={pedido.id} reserva={pedido.reserva} />
      ))}
    </div>
  );
};

export default PedidosByUser;


import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "./firebase";

export const getPedidosByUserEmail = async (email) => {
  const pedidosRef = collection(firestore, "pedidos");
  const q = query(pedidosRef, where("reserva.email", "==", email));

  const querySnapshot = await getDocs(q);
  const pedidos = [];

  querySnapshot.forEach((doc) => {
    pedidos.push(doc.data());
  });

  return pedidos;
};
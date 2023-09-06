import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
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

export const updatePedidoStatus = async (pedidoId, estado) => {
  const pedidoRef = doc(firestore, "pedidos", pedidoId);
  await updateDoc(pedidoRef, { estado });
};

export const getPedidos = async () => {
  const pedidosRef = collection(firestore, "pedidos");
  const querySnapshot = await getDocs(pedidosRef);
  const pedidos = [];

  querySnapshot.forEach((doc) => {
    pedidos.push(doc.data());
  });

  return pedidos;
};

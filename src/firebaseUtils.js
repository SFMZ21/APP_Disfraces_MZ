import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { cloudFunctions, firestore } from "./firebase";

function snapshotOrders(snapshot) {
  return snapshot.docs.map((order) => ({
    id: order.id,
    ...order.data(),
  }));
}

export function subscribeToUserOrders(user, onOrders, onError) {
  const sources = {
    canonical: [],
    legacy: [],
  };

  const emit = () => {
    const merged = new Map();

    [...sources.canonical, ...sources.legacy].forEach((order) => {
      merged.set(order.id, order);
    });

    onOrders(
      [...merged.values()].sort((left, right) => {
        const leftTime = left.createdAt?.toMillis?.() ?? 0;
        const rightTime = right.createdAt?.toMillis?.() ?? 0;
        return rightTime - leftTime;
      }),
    );
  };

  const ordersRef = collection(firestore, "pedidos");
  const unsubscribers = [
    onSnapshot(
      query(ordersRef, where("ownerId", "==", user.uid)),
      (snapshot) => {
        sources.canonical = snapshotOrders(snapshot);
        emit();
      },
      onError,
    ),
  ];

  if (user.email) {
    unsubscribers.push(
      onSnapshot(
        query(ordersRef, where("reserva.email", "==", user.email)),
        (snapshot) => {
          sources.legacy = snapshotOrders(snapshot);
          emit();
        },
        onError,
      ),
    );
  }

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
}

export async function updatePedidoStatus(orderId, status) {
  const updateStatus = httpsCallable(cloudFunctions, "updateReservationStatus");
  const response = await updateStatus({ orderId, status });
  return response.data;
}

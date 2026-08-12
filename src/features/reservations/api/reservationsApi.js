import { collection, onSnapshot, query, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { firestoreClient } from "../../../shared/firebase/firestore";
import { functionsClient } from "../../../shared/firebase/functions";
import { mapReservationError } from "../../../shared/errors/firebaseErrors";
import { validateReservationRequest } from "../model/reservationValidation";

function snapshotOrders(snapshot) {
  return snapshot.docs.map((order) => ({ id: order.id, ...order.data() }));
}

function toDate(value) {
  return value?.toDate?.() ?? (value ? new Date(value) : null);
}

export function subscribeUserOrders(user, onOrders, onError) {
  const sources = { canonical: [], legacy: [] };
  const emit = () => {
    const merged = new Map();
    [...sources.canonical, ...sources.legacy].forEach((order) => {
      merged.set(order.id, order);
    });
    onOrders(
      [...merged.values()].sort((left, right) =>
        (right.createdAt?.toMillis?.() ?? 0) -
        (left.createdAt?.toMillis?.() ?? 0)),
    );
  };
  const reportError = (error) => onError(mapReservationError(error));
  const ordersRef = collection(firestoreClient, "pedidos");
  const unsubscribers = [
    onSnapshot(query(ordersRef, where("ownerId", "==", user.uid)), (snapshot) => {
      sources.canonical = snapshotOrders(snapshot);
      emit();
    }, reportError),
  ];

  if (user.email) {
    unsubscribers.push(
      onSnapshot(
        query(ordersRef, where("reserva.email", "==", user.email)),
        (snapshot) => {
          sources.legacy = snapshotOrders(snapshot);
          emit();
        },
        reportError,
      ),
    );
  }

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
}

export function subscribeAdminOrders(onOrders, onError) {
  return onSnapshot(
    collection(firestoreClient, "pedidos"),
    (snapshot) => onOrders(snapshot.docs.map((order) => ({
      id: order.id,
      ...order.data().reserva,
      startDate: toDate(order.data().reserva?.startDate),
      endDate: toDate(order.data().reserva?.endDate),
    }))),
    (error) => onError(mapReservationError(error)),
  );
}

export async function createReservation(payload) {
  try {
    const validated = validateReservationRequest(payload);
    const callable = httpsCallable(functionsClient, "createReservation");
    const response = await callable({
      customer: validated.customer,
      items: validated.items.map((item) => ({
        documentId: item.documentId,
        quantity: item.quantity,
      })),
      startDate: validated.startDate.toISOString(),
      endDate: validated.endDate.toISOString(),
      purchaseStartedAt: payload.purchaseStartedAt.toISOString(),
    });
    return response.data;
  } catch (error) {
    if (error?.code?.startsWith("validation/")) throw error;
    throw mapReservationError(error);
  }
}

export async function updateReservationStatus(orderId, status) {
  try {
    const callable = httpsCallable(functionsClient, "updateReservationStatus");
    const response = await callable({ orderId, status });
    return response.data;
  } catch (error) {
    throw mapReservationError(error);
  }
}

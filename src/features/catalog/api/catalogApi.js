import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { firestoreClient } from "../../../shared/firebase/firestore";
import { storageClient } from "../../../shared/firebase/storage";
import { normalizeInventory } from "../../../shared/domain/inventory";
import { InventoryError } from "../../../shared/errors/AppError";
import { mapInventoryError } from "../../../shared/errors/firebaseErrors";
import {
  validateInventoryUpdate,
  validateProductForCreation,
} from "../model/productValidation";

export function normalizeProduct(snapshot) {
  const data = snapshot.data();

  return {
    ...data,
    ...normalizeInventory(data),
    documentId: snapshot.id,
    id: data.id ?? snapshot.id,
    price: Math.max(0, Number(data.price) || 0),
    size: data.size || "Única",
    img1: data.img1 || data.image || "",
    img2: data.img2 || data.image || "",
    img3: data.img3 || data.image || "",
  };
}

export function subscribeProducts(onProducts, onError) {
  return onSnapshot(
    query(collection(firestoreClient, "items")),
    (snapshot) => onProducts(snapshot.docs.map(normalizeProduct)),
    (error) => onError(
      mapInventoryError(error, "No fue posible cargar el catálogo."),
    ),
  );
}

export const subscribeInventory = subscribeProducts;

export async function uploadProductImage(productId, field, file) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "img";
  const imageRef = ref(
    storageClient,
    `products/${productId}/${crypto.randomUUID()}-${field}.${extension}`,
  );
  await uploadBytes(imageRef, file, { contentType: file.type });
  try {
    return { imageRef, url: await getDownloadURL(imageRef) };
  } catch (error) {
    await deleteObject(imageRef).catch(() => {});
    throw error;
  }
}

export async function createProduct(productData) {
  const product = validateProductForCreation(productData);
  const productId = String(product.id);
  const productRef = doc(firestoreClient, "items", productId);
  const [directSnapshot, legacySnapshot] = await Promise.all([
    getDoc(productRef),
    getDocs(
      query(collection(firestoreClient, "items"), where("id", "==", product.id)),
    ),
  ]);

  if (directSnapshot.exists() || !legacySnapshot.empty) {
    throw new InventoryError("El código del producto ya existe.", {
      code: "inventory/duplicate-product",
      userMessage: "Ya existe un producto con ese código.",
    });
  }

  const uploadedRefs = [];

  try {
    const uploadResults = await Promise.allSettled(
      ["image", "img1", "img2", "img3"].map(async (field) => {
        const uploaded = await uploadProductImage(productId, field, product[field]);
        return { field, ...uploaded };
      }),
    );
    const uploadedImages = uploadResults
      .filter((result) => result.status === "fulfilled")
      .map(({ value }) => {
        uploadedRefs.push(value.imageRef);
        return [value.field, value.url];
      });
    const failedUpload = uploadResults.find((result) => result.status === "rejected");
    if (failedUpload) throw failedUpload.reason;

    await setDoc(productRef, {
      ...product,
      ...Object.fromEntries(uploadedImages),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    await Promise.allSettled(uploadedRefs.map((imageRef) => deleteObject(imageRef)));
    if (error instanceof InventoryError || error?.code?.startsWith("validation/")) {
      throw error;
    }
    throw mapInventoryError(error, "No fue posible agregar el producto.");
  }
}

export async function updateProductInventory(productId, values) {
  try {
    const update = validateInventoryUpdate(values);
    await updateDoc(doc(firestoreClient, "items", productId), update);
  } catch (error) {
    if (error?.code?.startsWith("validation/")) throw error;
    throw mapInventoryError(error, "No fue posible actualizar el producto.");
  }
}

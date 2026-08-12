const { FieldValue } = require("firebase-admin/firestore");
const { USER_ROLES, resolveUserRole } = require("../domain/roles");

function authRecord(value) {
  if (!value) return null;
  return typeof value === "string" ? { uid: value } : value;
}

function nonNegativeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : fallback;
}

async function migrateLegacyProducts({ db, dryRun = true }) {
  const sourceSnapshot = await db.collection("products").get();
  const result = { entity: "products", dryRun, scanned: 0, created: 0, skipped: 0 };

  for (const source of sourceSnapshot.docs) {
    result.scanned += 1;
    const target = db.collection("items").doc(source.id);
    const existing = await target.get();
    if (existing.exists) {
      result.skipped += 1;
      continue;
    }

    if (!dryRun) {
      await target.set({
        ...source.data(),
        migratedFrom: `products/${source.id}`,
        migratedAt: FieldValue.serverTimestamp(),
      });
    }
    result.created += 1;
  }

  return result;
}

async function normalizeExistingItems({ db, dryRun = true }) {
  const snapshot = await db.collection("items").get();
  const result = { entity: "items", dryRun, scanned: 0, updated: 0, skipped: 0 };

  for (const source of snapshot.docs) {
    result.scanned += 1;
    const data = source.data();
    const cantidad = nonNegativeNumber(data.cantidad, 1);
    const enUso = nonNegativeNumber(data.enUso);
    const enStock = nonNegativeNumber(
      data.enStock,
      Math.max(0, cantidad - enUso),
    );
    const update = {};

    if (data.cantidad !== cantidad) update.cantidad = cantidad;
    if (data.enUso !== enUso) update.enUso = enUso;
    if (data.enStock !== enStock) update.enStock = enStock;

    if (Object.keys(update).length === 0) {
      result.skipped += 1;
      continue;
    }

    if (!dryRun) {
      await source.ref.update({
        ...update,
        normalizedAt: FieldValue.serverTimestamp(),
      });
    }
    result.updated += 1;
  }

  return result;
}

async function migrateLegacyUsers({
  db,
  resolveUserByEmail,
  resolveUserByUid,
  resolveUidByEmail,
  dryRun = true,
}) {
  const sourceSnapshot = await db.collection("users").get();
  const result = {
    entity: "users",
    dryRun,
    scanned: 0,
    created: 0,
    updated: 0,
    promoted: 0,
    unresolved: 0,
    skipped: 0,
  };

  for (const source of sourceSnapshot.docs) {
    const profile = source.data();
    result.scanned += 1;
    const email = profile.email || (source.id.includes("@") ? source.id : "");
    let resolvedAuthUser = null;

    if (email && (resolveUserByEmail || resolveUidByEmail)) {
      resolvedAuthUser = authRecord(await (resolveUserByEmail || resolveUidByEmail)(email));
    } else if (resolveUserByUid) {
      resolvedAuthUser = authRecord(await resolveUserByUid(profile.uid || source.id));
    }

    const uid = profile.uid || resolvedAuthUser?.uid || "";
    if (!uid) {
      result.unresolved += 1;
      continue;
    }

    const role = resolveUserRole({
      claims: resolvedAuthUser?.customClaims,
      profile,
    });
    const target = db.collection("users").doc(uid);
    const existing = await target.get();
    if (existing.exists) {
      const existingData = existing.data();
      const existingRole = resolveUserRole({ profile: existingData });
      const targetRole = role === USER_ROLES.ADMIN || existingRole === USER_ROLES.ADMIN
        ? USER_ROLES.ADMIN
        : USER_ROLES.USER;
      const update = {};

      if (existingData.uid !== uid) update.uid = uid;
      const targetEmail = existingData.email || resolvedAuthUser?.email || email;
      if (existingData.email !== targetEmail) update.email = targetEmail;
      const targetName = existingData.displayName || resolvedAuthUser?.displayName ||
        profile.displayName || profile.nombre || "";
      if (existingData.displayName !== targetName) update.displayName = targetName;
      if (existingData.role !== targetRole) update.role = targetRole;
      if (!existingData.createdAt) {
        update.createdAt = FieldValue.serverTimestamp();
      }

      if (Object.keys(update).length > 0) {
        if (!dryRun) {
          await target.update(update);
        }
        result.updated += 1;
        if (targetRole === USER_ROLES.ADMIN && existingRole !== USER_ROLES.ADMIN) {
          result.promoted += 1;
        }
      } else {
        result.skipped += 1;
      }
      continue;
    }

    if (!dryRun) {
      await target.set({
        uid,
        email: resolvedAuthUser?.email || email,
        displayName: resolvedAuthUser?.displayName ||
          profile.displayName || profile.nombre || "",
        role,
        createdAt: profile.createdAt || FieldValue.serverTimestamp(),
        migratedFrom: `users/${source.id}`,
        migratedAt: FieldValue.serverTimestamp(),
      });
    }
    result.created += 1;
  }

  return result;
}

module.exports = {
  migrateLegacyProducts,
  migrateLegacyUsers,
  normalizeExistingItems,
};

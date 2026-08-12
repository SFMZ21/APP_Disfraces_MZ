export const USER_ROLES = Object.freeze({
  USER: "user",
  ADMIN: "admin",
});

export function resolveUserRole({ claims = {}, profile = null, profiles = [] } = {}) {
  const candidates = [profile, ...profiles].filter(Boolean);
  if (
    claims.admin === true ||
    candidates.some((candidate) =>
      candidate.role === USER_ROLES.ADMIN ||
      candidate.rol === "administrador" ||
      candidate.isAdmin === true)
  ) {
    return USER_ROLES.ADMIN;
  }

  return USER_ROLES.USER;
}

export function isAdminRole(role) {
  return role === USER_ROLES.ADMIN;
}

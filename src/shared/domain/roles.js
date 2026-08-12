export const USER_ROLES = Object.freeze({
  USER: "user",
  ADMIN: "admin",
});

export function resolveUserRole({ claims = {}, profile = null } = {}) {
  if (
    claims.admin === true ||
    profile?.role === USER_ROLES.ADMIN ||
    profile?.rol === "administrador" ||
    profile?.isAdmin === true
  ) {
    return USER_ROLES.ADMIN;
  }

  return USER_ROLES.USER;
}

export function isAdminRole(role) {
  return role === USER_ROLES.ADMIN;
}

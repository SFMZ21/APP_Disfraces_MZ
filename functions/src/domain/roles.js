const USER_ROLES = Object.freeze({ USER: "user", ADMIN: "admin" });

function resolveUserRole({ claims = {}, profile = null, profiles = [] } = {}) {
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

module.exports = { USER_ROLES, resolveUserRole };

import { describe, expect, it } from "vitest";
import { resolveUserRole, USER_ROLES } from "./roles";

describe("resolveUserRole", () => {
  it("resuelve usuario por defecto", () => {
    expect(resolveUserRole()).toBe(USER_ROLES.USER);
  });

  it.each([
    [{ claims: { admin: true } }, "custom claim"],
    [{ profile: { role: "admin" } }, "role"],
    [{ profile: { rol: "administrador" } }, "rol histórico"],
    [{ profile: { isAdmin: true } }, "isAdmin histórico"],
  ])("preserva administradores mediante %s", (input) => {
    expect(resolveUserRole(input)).toBe(USER_ROLES.ADMIN);
  });

  it("preserva un administrador histórico aunque exista perfil normal por UID", () => {
    expect(resolveUserRole({
      profiles: [
        { uid: "admin-uid", role: "user" },
        { email: "admin@example.com", role: "admin" },
      ],
    })).toBe(USER_ROLES.ADMIN);
  });
});

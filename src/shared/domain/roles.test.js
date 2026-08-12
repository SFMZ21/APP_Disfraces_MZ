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
});

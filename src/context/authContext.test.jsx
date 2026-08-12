import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  loginWithEmail,
  subscribeToAuthentication,
} from "../features/auth/api/authApi";
import { AuthProvider, useAuth } from "./authContext";

vi.mock("../features/auth/api/authApi", () => ({
  loginWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
  logoutUser: vi.fn(),
  registerWithEmail: vi.fn(),
  subscribeToAuthentication: vi.fn(),
}));

function AuthProbe() {
  const { user, loading, login } = useAuth();
  return (
    <div>
      <span>{loading ? "loading" : user?.role || "anonymous"}</span>
      <button type="button" onClick={() => login("user@example.com", "password123")}>Login</button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("expone loading y luego el usuario resuelto por la API", async () => {
    let emitUser;
    subscribeToAuthentication.mockImplementation((onUser) => {
      emitUser = onUser;
      return vi.fn();
    });
    render(<AuthProvider><AuthProbe /></AuthProvider>);
    expect(screen.getByText("loading")).toBeInTheDocument();
    act(() => emitUser({ uid: "admin", role: "admin", isAdmin: true }));
    await waitFor(() => expect(screen.getByText("admin")).toBeInTheDocument());
  });

  it("delega el login sin exponer Firebase al consumidor", async () => {
    subscribeToAuthentication.mockImplementation(() => vi.fn());
    loginWithEmail.mockResolvedValue({ user: { uid: "user" } });
    const user = userEvent.setup();
    render(<AuthProvider><AuthProbe /></AuthProvider>);
    await user.click(screen.getByRole("button", { name: "Login" }));
    expect(loginWithEmail).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    });
  });
});

export function PageState({ children, kind = "status", role }) {
  const className = kind === "error" ? "error-message" : "page-status";
  const resolvedRole = role ?? (kind === "error" ? "alert" : "status");

  return <p className={className} role={resolvedRole}>{children}</p>;
}

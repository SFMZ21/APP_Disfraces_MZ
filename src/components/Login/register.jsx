import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Logo from "../../images/BienvenidaHada.svg";
import { useAuth } from "../../context/authContext";
import { getUserErrorMessage } from "../../shared/errors/AppError";

export function Register() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { registro, user, loading } = useAuth();
  const navigate = useNavigate();

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = ({ target: { name, value } }) => {
    setCredentials((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await registro(credentials.email, credentials.password);
      navigate("/", { replace: true });
    } catch (registrationError) {
      setError(getUserErrorMessage(registrationError, "No fue posible crear la cuenta."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-general">
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1 className="title-login">¡Regístrate!</h1>
          {error && <p className="error-message" role="alert">{error}</p>}

          <div className="form-group">
            <label htmlFor="email">Correo electrónico:</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="Ingresa tu correo electrónico"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <button type="submit" className="login-btn" disabled={submitting}>
            {submitting ? "Creando cuenta…" : "Registrar"}
          </button>
          <button
            type="button"
            className="login-btn2"
            onClick={() => navigate("/login")}
          >
            Tengo una cuenta existente
          </button>
        </form>

        <div className="logo-login" aria-hidden="true">
          <img src={Logo} alt="" />
        </div>
      </div>
    </main>
  );
}

import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Logo from "../../images/LogoHada2.svg";
import LogoGoogle from "../../images/google.png";
import { useAuth } from "../../context/authContext";

function readableAuthError(error) {
  const code = error?.code ?? "";

  if (code.includes("invalid-credential")) {
    return "El correo o la contraseña no son correctos.";
  }
  if (code.includes("too-many-requests")) {
    return "Hay demasiados intentos. Espera un momento y vuelve a intentar.";
  }
  if (code.includes("popup-closed")) {
    return "Se cerró la ventana de Google antes de completar el acceso.";
  }
  return "No fue posible iniciar sesión. Intenta nuevamente.";
}

export function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, logInGoogle, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from?.pathname || "/";

  if (!loading && user) {
    return <Navigate to={destination} replace />;
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
      await login(credentials.email, credentials.password);
      navigate(destination, { replace: true });
    } catch (authError) {
      setError(readableAuthError(authError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setError("");

    try {
      await logInGoogle();
      navigate(destination, { replace: true });
    } catch (authError) {
      setError(readableAuthError(authError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-general">
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1 className="title-login">Iniciar sesión</h1>
          {error && <p className="error-message" role="alert">{error}</p>}

          <div className="form-group">
            <label htmlFor="email">Correo electrónico:</label>
            <input
              type="email"
              className="form-control"
              name="email"
              id="email"
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
              name="password"
              id="password"
              value={credentials.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="Ingresa tu contraseña"
            />
          </div>
          <button type="submit" className="login-btn" disabled={submitting}>
            {submitting ? "Ingresando…" : "Iniciar sesión"}
          </button>
          <button
            type="button"
            className="login-btn3"
            onClick={handleGoogleLogin}
            disabled={submitting}
          >
            <img src={LogoGoogle} className="image-google" height="30" alt="" />
            Iniciar sesión con Google
          </button>
          <button
            type="button"
            className="login-btn2"
            onClick={() => navigate("/register")}
          >
            Crear una cuenta
          </button>
        </form>

        <div className="logo-login" aria-hidden="true">
          <img src={Logo} alt="" />
        </div>
      </div>
    </main>
  );
}

export default Login;

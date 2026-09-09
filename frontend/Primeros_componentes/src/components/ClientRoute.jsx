import { Navigate } from "react-router-dom";

function ClientRoute({ children }) {
  const usuarioGuardado =
    localStorage.getItem("authUser") ?? sessionStorage.getItem("authUser");

  try {
    const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

    if (!usuario) {
      return <Navigate to="/iniciar-sesion" replace />;
    }

    if (usuario.id_rol !== 3) {
      return <Navigate to="/" replace />;
    }

    return children;
  } catch {
    return <Navigate to="/iniciar-sesion" replace />;
  }
}

export default ClientRoute;

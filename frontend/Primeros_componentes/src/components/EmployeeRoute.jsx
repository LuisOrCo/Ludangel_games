import { Navigate } from "react-router-dom";

function EmployeeRoute({ children }) {
  const usuarioGuardado =
    localStorage.getItem("authUser") ?? sessionStorage.getItem("authUser");

  try {
    const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

    if (!usuario) return <Navigate to="/iniciar-sesion" replace />;
    if (usuario.id_rol !== 2) return <Navigate to="/" replace />;

    return children;
  } catch {
    return <Navigate to="/iniciar-sesion" replace />;
  }
}

export default EmployeeRoute;

import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  const actualizarSesion = () => {
    const usuarioGuardado =
      localStorage.getItem("authUser") ?? sessionStorage.getItem("authUser");

    try {
      setUsuario(usuarioGuardado ? JSON.parse(usuarioGuardado) : null);
    } catch {
      localStorage.removeItem("authUser");
      sessionStorage.removeItem("authUser");
      setUsuario(null);
    }
  };

  useEffect(() => {
    actualizarSesion();
    window.addEventListener("authChanged", actualizarSesion);
    window.addEventListener("storage", actualizarSesion);

    return () => {
      window.removeEventListener("authChanged", actualizarSesion);
      window.removeEventListener("storage", actualizarSesion);
    };
  }, []);

  // Cerrar el menú si se hace clic fuera del componente
  useEffect(() => {
    const handleClickAfuera = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickAfuera);
    return () => document.removeEventListener("mousedown", handleClickAfuera);
  }, []);

  // Cerrar el menú al navegar
  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const cerrarSesion = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
    setUsuario(null);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-[#1e293b]">
      <nav className="max-w-7xl mx-auto h-20 px-6 sm:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group no-underline">
          <img
            src={logo}
            alt="LudAngel Games Logo"
            className="h-12 w-auto object-contain rounded-xl shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform"
          />
          <span className="text-2xl font-black tracking-wide bg-gradient-to-r from-white via-slate-200 to-[#06b6d4] bg-clip-text text-transparent">
            LUDANGEL <span className="text-[#06b6d4]">GAMES</span>
          </span>
        </Link>

        <ul className="flex items-center gap-2 sm:gap-4 list-none m-0 p-0">
          <li>
            <Link
              to="/"
              className={`px-4 py-2 rounded-xl text-sm font-semibold no-underline transition-all ${
                isActive("/")
                  ? "text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/30 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              Inicio
            </Link>
          </li>

          <li>
            <Link
              to="/productos"
              className={`px-4 py-2 rounded-xl text-sm font-semibold no-underline transition-all ${
                isActive("/productos")
                  ? "text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/30 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              Productos
            </Link>
          </li>

          <li>
            <Link
              to="/quienes-somos"
              className={`px-4 py-2 rounded-xl text-sm font-semibold no-underline transition-all ${
                isActive("/quienes-somos")
                  ? "text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/30 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              ¿Quiénes somos?
            </Link>
          </li>

          <li>
            <Link
              to="/contacto"
              className={`px-4 py-2 rounded-xl text-sm font-semibold no-underline transition-all ${
                isActive("/contacto")
                  ? "text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/30 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              Contacto
            </Link>
          </li>

          {usuario ? (
            /* MENÚ DESPLEGABLE DE USUARIO */
            <li className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="flex items-center gap-2.5 rounded-xl border border-[#06b6d4]/30 bg-[#0f172a] px-4 py-2 text-sm font-bold text-white shadow-md shadow-cyan-500/10 transition-all hover:border-[#06b6d4] hover:bg-[#1e293b] cursor-pointer"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#06b6d4] to-[#0284c7] text-xs font-black text-slate-950">
                  {usuario.nombre ? usuario.nombre[0].toUpperCase() : "U"}
                </span>
                <span>
                  Bienvenido, <span className="text-[#06b6d4]">{usuario.nombre}</span>
                </span>
                <span
                  className={`text-[10px] text-slate-400 transition-transform duration-200 ${
                    menuAbierto ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {menuAbierto && (
                <div className="absolute right-0 mt-2.5 w-64 rounded-2xl border border-slate-700 bg-[#0f172a] p-2 shadow-2xl shadow-black/80 backdrop-blur-xl z-50 animate-fade-in">
                  {/* CABECERA CON DATOS DEL USUARIO */}
                  <div className="border-b border-slate-800 px-3.5 py-3">
                    <p className="text-sm font-bold text-white truncate m-0">
                      {usuario.nombre} {usuario.apellido || ""}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5 mb-2">
                      {usuario.correo}
                    </p>
                    <span className="inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300">
                      Rol: {usuario.id_rol === 1 ? "Administrador" : usuario.id_rol === 2 ? "Empleado" : "Cliente"}
                    </span>
                  </div>

                  {/* ENLACES A LOS PANELES SEGÚN ROL */}
                  <div className="py-2 flex flex-col gap-1">
                    {usuario.id_rol === 1 && (
                      <>
                        <Link
                          to="/admin"
                          onClick={() => setMenuAbierto(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-[#06b6d4]/10 hover:text-[#06b6d4] no-underline transition-colors"
                        >
                          <span>📊</span> Dashboard Admin
                        </Link>
                        <Link
                          to="/admin/usuarios"
                          onClick={() => setMenuAbierto(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-[#06b6d4]/10 hover:text-[#06b6d4] no-underline transition-colors"
                        >
                          <span>👥</span> Gestión de Usuarios
                        </Link>
                        <Link
                          to="/admin/productos"
                          onClick={() => setMenuAbierto(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-[#06b6d4]/10 hover:text-[#06b6d4] no-underline transition-colors"
                        >
                          <span>🎮</span> Gestión de Productos
                        </Link>
                      </>
                    )}

                    {usuario.id_rol === 2 && (
                      <>
                        <Link
                          to="/empleado"
                          onClick={() => setMenuAbierto(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300 no-underline transition-colors"
                        >
                          <span>💼</span> Panel de Empleado
                        </Link>
                        <Link
                          to="/empleado/productos"
                          onClick={() => setMenuAbierto(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300 no-underline transition-colors"
                        >
                          <span>🎮</span> Gestión de Productos
                        </Link>
                      </>
                    )}

                    {usuario.id_rol === 3 && (
                      <Link
                        to="/cliente"
                        onClick={() => setMenuAbierto(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-[#06b6d4]/10 hover:text-[#06b6d4] no-underline transition-colors"
                      >
                        <span>👤</span> Mi Panel / Perfil
                      </Link>
                    )}
                  </div>

                  {/* BOTÓN CERRAR SESIÓN */}
                  <div className="border-t border-slate-800 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuAbierto(false);
                        cerrarSesion();
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-colors text-left cursor-pointer border-none bg-transparent"
                    >
                      <span>🚪</span> Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </li>
          ) : (
            <li>
              <Link
                to="/iniciar-sesion"
                className={`px-4 py-2.5 rounded-xl text-sm font-bold no-underline transition-all flex items-center gap-2 shadow-md ${
                  isActive("/iniciar-sesion")
                    ? "bg-gradient-to-r from-[#06b6d4] to-[#0284c7] text-slate-950 shadow-cyan-500/30 scale-[1.02]"
                    : "bg-slate-800 hover:bg-[#06b6d4] text-slate-200 hover:text-slate-950 border border-slate-700/80 hover:shadow-cyan-500/20"
                }`}
              >
                <span>👤</span>
                <span>Iniciar Sesión</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;

import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";

function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const usuario = useMemo(() => {
    const usuarioGuardado =
      localStorage.getItem("authUser") ?? sessionStorage.getItem("authUser");
    try {
      return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    } catch {
      return null;
    }
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
    navigate("/");
  };

  const menuItems = [
    {
      ruta: "/admin",
      etiqueta: "Dashboard / Resumen",
      icono: "📊",
      descripcion: "Métricas y vista general",
    },
    {
      ruta: "/admin/usuarios",
      etiqueta: "Gestión de Usuarios",
      icono: "👥",
      descripcion: "CRUD completo y roles",
    },
    {
      ruta: "/admin/productos",
      etiqueta: "Gestión de Productos",
      icono: "🎮",
      descripcion: "Catálogo, precios y stock",
    },
  ];

  const accesosPublicos = [
    { ruta: "/", etiqueta: "Página de Inicio", icono: "🏠" },
    { ruta: "/productos", etiqueta: "Catálogo Público", icono: "🛒" },
  ];

  const esActivo = (ruta) => location.pathname === ruta;

  return (
    <div className="flex min-h-screen bg-[#070b14] text-white">
      {/* OVERLAY PARA MÓVILES */}
      {sidebarAbierto && (
        <div
          onClick={() => setSidebarAbierto(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* MENÚ LATERAL (SIDEBAR) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-slate-800 bg-[#0b1120] p-6 shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarAbierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* HEADER DEL SIDEBAR */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <Link to="/admin" className="flex items-center gap-3 no-underline">
              <img
                src={logo}
                alt="LudAngel Games Logo"
                className="h-10 w-auto rounded-xl shadow-md border border-slate-700/60"
              />
              <div>
                <span className="text-base font-black tracking-wide text-white block">
                  LUDANGEL <span className="text-[#06b6d4]">GAMES</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#06b6d4]">
                  Panel Administrativo
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarAbierto(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 lg:hidden"
            >
              ✕
            </button>
          </div>

          {/* PERFIL DEL ADMINISTRADOR */}
          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-3.5 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#06b6d4] to-[#0284c7] font-black text-slate-950 text-base shadow-md">
              {usuario?.nombre ? usuario.nombre[0].toUpperCase() : "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate m-0">
                {usuario?.nombre} {usuario?.apellido || ""}
              </p>
              <span className="inline-block rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/20">
                Administrador
              </span>
            </div>
          </div>

          {/* NAVEGACIÓN PRINCIPAL DEL DASHBOARD */}
          <div className="flex flex-col gap-1.5">
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Navegación Admin
            </span>
            {menuItems.map((item) => (
              <Link
                key={item.ruta}
                to={item.ruta}
                onClick={() => setSidebarAbierto(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold no-underline transition-all ${
                  esActivo(item.ruta)
                    ? "bg-gradient-to-r from-[#06b6d4] to-[#0284c7] text-slate-950 shadow-lg shadow-cyan-500/20 font-black"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icono}</span>
                <div className="flex flex-col">
                  <span>{item.etiqueta}</span>
                  <span
                    className={`text-[11px] font-normal ${
                      esActivo(item.ruta) ? "text-slate-900" : "text-slate-500"
                    }`}
                  >
                    {item.descripcion}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* VISTAS PÚBLICAS */}
          <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-800">
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Vistas Públicas
            </span>
            {accesosPublicos.map((item) => (
              <Link
                key={item.ruta}
                to={item.ruta}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-400 no-underline transition-all hover:bg-slate-800/50 hover:text-slate-200"
              >
                <span>{item.icono}</span>
                <span>{item.etiqueta}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* PIE DEL SIDEBAR: CERRAR SESIÓN */}
        <div className="border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={cerrarSesion}
            className="flex w-full items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 transition-colors hover:bg-red-500/20 cursor-pointer"
          >
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOPBAR DEL DASHBOARD */}
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-[#0b1120]/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarAbierto(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-lg lg:hidden"
            >
              ☰
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Sección:</span>
              <span className="text-sm font-extrabold text-[#06b6d4]">
                {location.pathname === "/admin"
                  ? "Dashboard Principal"
                  : location.pathname === "/admin/usuarios"
                  ? "Gestión de Usuarios"
                  : location.pathname === "/admin/productos"
                  ? "Gestión de Productos"
                  : "Administración"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              API FastAPI Conectada
            </span>
          </div>
        </header>

        {/* CONTENIDO HIJO */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#070b14]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

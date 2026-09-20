import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";

function EmployeeLayout({ children }) {
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
      ruta: "/empleado",
      etiqueta: "Dashboard / Resumen",
      icono: "📊",
      descripcion: "Vista general del panel",
    },
    {
      ruta: "/empleado/productos",
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
    <div className="flex h-dvh overflow-hidden bg-[#070b14] text-white">
      {/* OVERLAY PARA MÓVILES */}
      {sidebarAbierto && (
        <div
          onClick={() => setSidebarAbierto(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* MENÚ LATERAL (SIDEBAR INDEPENDIENTE) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-[#0b1120] p-4 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarAbierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* HEADER Y PERFIL DEL EMPLEADO (FIJOS ARRIBA) */}
        <div className="shrink-0 flex flex-col gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <Link to="/empleado" className="flex items-center gap-3 no-underline">
              <img
                src={logo}
                alt="LudAngel Games Logo"
                className="h-9 w-auto rounded-xl shadow-md border border-slate-700/60"
              />
              <div>
                <span className="text-base font-black tracking-wide text-white block leading-tight">
                  LUDANGEL <span className="text-emerald-400">GAMES</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Panel Empleado
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

          <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-3 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 font-black text-slate-950 text-sm shadow-md">
              {usuario?.nombre ? usuario.nombre[0].toUpperCase() : "E"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate m-0">
                {usuario?.nombre} {usuario?.apellido || ""}
              </p>
              <span className="inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/20">
                Empleado
              </span>
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN Y ENLACES (SCROLL INDEPENDIENTE) */}
        <div className="flex-1 min-h-0 overflow-y-auto py-3 pr-1 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="flex flex-col gap-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Menú</span>
            {menuItems.map((item) => (
              <Link
                key={item.ruta}
                to={item.ruta}
                onClick={() => setSidebarAbierto(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold no-underline transition-all ${
                  esActivo(item.ruta)
                    ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <span className="text-base">{item.icono}</span>
                <span>{item.etiqueta}</span>
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-1 pt-3 border-t border-slate-800/80">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Vistas Públicas
            </span>
            {accesosPublicos.map((item) => (
              <Link
                key={item.ruta}
                to={item.ruta}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 no-underline transition-all hover:bg-slate-800/50 hover:text-slate-200"
              >
                <span>{item.icono}</span>
                <span>{item.etiqueta}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* PIE DEL SIDEBAR: CERRAR SESIÓN (SIEMPRE FIJO ABAJO) */}
        <div className="shrink-0 border-t border-slate-800 pt-3 mt-auto">
          <button
            type="button"
            onClick={cerrarSesion}
            className="flex w-full items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs font-bold text-red-300 transition-colors hover:bg-red-500/20 cursor-pointer"
          >
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:pl-64">
        {/* TOPBAR */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-[#0b1120]/80 px-4 sm:px-6 backdrop-blur-md">
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
              <span className="text-sm font-extrabold text-emerald-400">
                {location.pathname === "/empleado"
                  ? "Dashboard Principal"
                  : location.pathname === "/empleado/productos"
                  ? "Gestión de Productos"
                  : "Panel de Empleado"}
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
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8 bg-[#070b14]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default EmployeeLayout;

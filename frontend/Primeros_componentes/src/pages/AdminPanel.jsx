import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function AdminPanel() {
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalProductos, setTotalProductos] = useState(0);
  const [cargandoStats, setCargandoStats] = useState(true);

  const usuario = useMemo(() => {
    const usuarioGuardado =
      localStorage.getItem("authUser") ?? sessionStorage.getItem("authUser");
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  }, []);

  useEffect(() => {
    const cargarMetricas = async () => {
      try {
        const token =
          localStorage.getItem("authToken") ?? sessionStorage.getItem("authToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [resUsers, resProds] = await Promise.all([
          fetch(`${API_URL}/api/v1/usuarios/`, { headers }).catch(() => null),
          fetch(`${API_URL}/api/v1/productos/`).catch(() => null),
        ]);

        if (resUsers && resUsers.ok) {
          const dataUsers = await resUsers.json();
          setTotalUsuarios(dataUsers.total ?? dataUsers.usuarios?.length ?? 0);
        }

        if (resProds && resProds.ok) {
          const dataProds = await resProds.json();
          setTotalProductos(dataProds.total ?? dataProds.productos?.length ?? 0);
        }
      } finally {
        setCargandoStats(false);
      }
    };

    cargarMetricas();
  }, []);

  const metricas = [
    {
      titulo: "Usuarios Registrados",
      valor: cargandoStats ? "..." : totalUsuarios,
      icono: "👥",
      descripcion: "Cuentas en base de datos",
      color: "from-cyan-500/20 to-blue-500/10",
      borde: "border-cyan-500/30",
      ruta: "/admin/usuarios",
    },
    {
      titulo: "Catálogo de Productos",
      valor: cargandoStats ? "..." : totalProductos,
      icono: "🎮",
      descripcion: "Items en inventario",
      color: "from-emerald-500/20 to-teal-500/10",
      borde: "border-emerald-500/30",
      ruta: "/admin/productos",
    },
    {
      titulo: "Roles del Sistema",
      valor: "3",
      icono: "🛡️",
      descripcion: "Admin, Empleado, Cliente",
      color: "from-purple-500/20 to-indigo-500/10",
      borde: "border-purple-500/30",
    },
    {
      titulo: "Estado FastAPI",
      valor: "100%",
      icono: "⚡",
      descripcion: "Servidor y MySQL en línea",
      color: "from-amber-500/20 to-orange-500/10",
      borde: "border-amber-500/30",
    },
  ];

  const modulos = [
    {
      icono: "👥",
      titulo: "Gestión de usuarios",
      descripcion:
        "Consulta, registra, edita, cambia el estado (activo/inactivo) y elimina usuarios del sistema.",
      acciones: ["Listar usuarios", "Crear usuario", "Editar datos", "Eliminar / Estado"],
      ruta: "/admin/usuarios",
      colorBtn: "bg-[#06b6d4] hover:bg-cyan-300 text-slate-950",
    },
    {
      icono: "🎮",
      titulo: "Gestión de productos",
      descripcion:
        "Administra el catálogo de productos de LUDANGEL Games, precios, stock e imágenes.",
      acciones: ["Listar productos", "Crear producto", "Modificar stock", "Eliminar / Estado"],
      ruta: "/admin/productos",
      colorBtn: "bg-emerald-400 hover:bg-emerald-300 text-slate-950",
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* BIENVENIDA HERO */}
      <section className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/15 via-[#0f172a] to-[#0f172a] p-6 sm:p-8 shadow-xl shadow-cyan-500/5">
        <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
          Panel de Control Administrativo
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Hola, <span className="text-[#06b6d4]">{usuario?.nombre}</span>
        </h1>
        <p className="mt-2 text-sm text-slate-300 sm:text-base max-w-2xl">
          Bienvenido a tu panel de control. Utiliza el menú lateral para navegar entre la gestión de usuarios y el inventario de productos.
        </p>
      </section>

      {/* TARJETAS DE MÉTRICAS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricas.map((m) => (
          <div
            key={m.titulo}
            className={`rounded-2xl border ${m.borde} bg-gradient-to-br ${m.color} p-5 shadow-lg flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{m.icono}</span>
              <span className="text-3xl font-black text-white">{m.valor}</span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-white">{m.titulo}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{m.descripcion}</p>
            </div>
          </div>
        ))}
      </section>

      {/* MÓDULOS DE ADMINISTRACIÓN */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Módulos Administrativos</h2>
          <p className="text-xs text-slate-400">Accede directamente a los submódulos de la plataforma.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {modulos.map((modulo) => (
            <article
              key={modulo.titulo}
              className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-xl transition-colors hover:border-cyan-500/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-2xl">
                    {modulo.icono}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{modulo.titulo}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">{modulo.descripcion}</p>
                  </div>
                </div>
                <ul className="mt-5 space-y-1.5 border-t border-slate-800/80 pt-4 text-xs text-slate-300">
                  {modulo.acciones.map((accion) => (
                    <li key={accion} className="flex items-center gap-2">
                      <span className="text-[#06b6d4]">✓</span>
                      {accion}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to={modulo.ruta}
                className={`mt-6 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-black no-underline transition-transform hover:-translate-y-0.5 ${modulo.colorBtn}`}
              >
                {modulo.titulo === "Gestión de usuarios" ? "Gestionar Usuarios →" : "Gestionar Productos →"}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminPanel;

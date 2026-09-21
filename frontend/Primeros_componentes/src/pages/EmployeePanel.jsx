import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config/api";

function EmployeePanel() {
  const [totalProductos, setTotalProductos] = useState(0);
  const [productosActivos, setProductosActivos] = useState(0);
  const [productosInactivos, setProductosInactivos] = useState(0);
  const [cargando, setCargando] = useState(true);

  const usuario = useMemo(() => {
    const guardado = localStorage.getItem("authUser") ?? sessionStorage.getItem("authUser");
    return guardado ? JSON.parse(guardado) : null;
  }, []);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/productos/`).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          const lista = data.productos ?? [];
          setTotalProductos(data.total ?? lista.length);
          setProductosActivos(lista.filter((p) => p.estado).length);
          setProductosInactivos(lista.filter((p) => !p.estado).length);
        }
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const metricas = [
    {
      titulo: "Total de Productos",
      valor: cargando ? "..." : totalProductos,
      icono: "🎮",
      descripcion: "En el catálogo",
      color: "from-emerald-500/20 to-teal-500/10",
      borde: "border-emerald-500/30",
    },
    {
      titulo: "Productos Activos",
      valor: cargando ? "..." : productosActivos,
      icono: "✅",
      descripcion: "Visibles al público",
      color: "from-green-500/20 to-emerald-500/10",
      borde: "border-green-500/30",
    },
    {
      titulo: "Productos Inactivos",
      valor: cargando ? "..." : productosInactivos,
      icono: "⛔",
      descripcion: "Deshabilitados",
      color: "from-slate-500/20 to-slate-700/10",
      borde: "border-slate-500/30",
    },
  ];

  return (
    <div className="flex max-w-5xl mx-auto flex-col gap-6">
      {/* BIENVENIDA HERO */}
      <section className="border-b border-slate-800 pb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Resumen</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Hola, <span className="text-emerald-400">{usuario?.nombre}</span>
        </h1>
        <p className="mt-2 text-sm text-slate-300 sm:text-base max-w-2xl">
          Desde este panel puedes consultar y gestionar el catálogo de productos.
        </p>
      </section>

      {/* TARJETAS DE MÉTRICAS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metricas.map((m) => (
          <div
            key={m.titulo}
            className={`rounded-2xl border ${m.borde} bg-gradient-to-br ${m.color} p-5 flex flex-col justify-between`}
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

      {/* MÓDULO DE ACCESO RÁPIDO */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Acciones rápidas</h2>
          <p className="text-xs text-slate-400">Gestiona el catálogo de productos.</p>
        </div>

        <article className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 transition-colors hover:border-emerald-500/50 flex flex-col justify-between max-w-md">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-2xl">
              🎮
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Gestión de productos</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Consulta, crea, edita, cambia el estado y elimina productos del catálogo.
              </p>
            </div>
          </div>
          <Link
            to="/empleado/productos"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-4 py-2.5 text-xs font-black no-underline transition-transform hover:-translate-y-0.5"
          >
            Gestionar Productos →
          </Link>
        </article>
      </section>
    </div>
  );
}

export default EmployeePanel;

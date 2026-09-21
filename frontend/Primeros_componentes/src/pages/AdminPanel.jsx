import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config/api";

function AdminPanel() {
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalProductos, setTotalProductos] = useState(0);
  const [productosActivos, setProductosActivos] = useState(0);
  const [productosInactivos, setProductosInactivos] = useState(0);
  const [stockTotal, setStockTotal] = useState(0);
  const [productosBajoStock, setProductosBajoStock] = useState(0);
  const [totalEmpleados, setTotalEmpleados] = useState(0);
  const [totalVentas, setTotalVentas] = useState(0);
  const [ingresosTotales, setIngresosTotales] = useState(0);
  const [pqrsPendientes, setPqrsPendientes] = useState(0);
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

        const [resDash, resUsers, resProds] = await Promise.all([
          fetch(`${API_URL}/api/v1/reportes/dashboard`, { headers }).catch(() => null),
          fetch(`${API_URL}/api/v1/usuarios/`, { headers }).catch(() => null),
          fetch(`${API_URL}/api/v1/productos/`).catch(() => null),
        ]);

        if (resDash && resDash.ok) {
          const dash = await resDash.json();
          setTotalVentas(dash.ventas?.total_ventas ?? 0);
          setIngresosTotales(dash.ventas?.ingresos_totales ?? 0);
          setPqrsPendientes(dash.pqrs?.pendientes ?? 0);
        }

        if (resUsers && resUsers.ok) {
          const dataUsers = await resUsers.json();
          const lista = dataUsers.usuarios ?? [];
          setTotalUsuarios(dataUsers.total ?? lista.length);
          setTotalEmpleados(
            lista.filter((u) => (u.rol ?? "").toLowerCase() === "empleado").length
          );
        }

        if (resProds && resProds.ok) {
          const dataProds = await resProds.json();
          const lista = dataProds.productos ?? [];
          setTotalProductos(dataProds.total ?? lista.length);
          setProductosActivos(lista.filter((p) => p.estado).length);
          setProductosInactivos(lista.filter((p) => !p.estado).length);
          setStockTotal(lista.reduce((acc, p) => acc + (p.stock ?? 0), 0));
          setProductosBajoStock(lista.filter((p) => p.estado && (p.stock ?? 0) <= 5).length);
        }
      } finally {
        setCargandoStats(false);
      }
    };

    cargarMetricas();
  }, []);

  const val = (v) => (cargandoStats ? "..." : v);

  const metricas = [
    {
      titulo: "Usuarios Registrados",
      valor: val(totalUsuarios),
      icono: "👥",
      descripcion: "Cuentas en el sistema",
      color: "from-cyan-500/20 to-blue-500/10",
      borde: "border-cyan-500/30",
      ruta: "/admin/usuarios",
    },
    {
      titulo: "Empleados",
      valor: val(totalEmpleados),
      icono: "🧑‍💼",
      descripcion: "Usuarios con rol empleado",
      color: "from-sky-500/20 to-cyan-500/10",
      borde: "border-sky-500/30",
      ruta: "/admin/usuarios",
    },
    {
      titulo: "Total Productos",
      valor: val(totalProductos),
      icono: "🎮",
      descripcion: "Productos en el catálogo",
      color: "from-emerald-500/20 to-teal-500/10",
      borde: "border-emerald-500/30",
      ruta: "/admin/productos",
    },
    {
      titulo: "Ventas Realizadas",
      valor: val(totalVentas),
      icono: "🛒",
      descripcion: `Ingresos: $${ingresosTotales.toLocaleString()}`,
      color: "from-indigo-500/20 to-purple-500/10",
      borde: "border-indigo-500/30",
      ruta: "/admin/ventas",
    },
    {
      titulo: "PQRS Pendientes",
      valor: val(pqrsPendientes),
      icono: "📩",
      descripcion: "Solicitudes por responder",
      color: "from-amber-500/20 to-orange-500/10",
      borde: "border-amber-500/30",
      ruta: "/admin/pqrs",
    },
    {
      titulo: "Productos Activos",
      valor: val(productosActivos),
      icono: "✅",
      descripcion: "Visibles en tienda pública",
      color: "from-green-500/20 to-emerald-500/10",
      borde: "border-green-500/30",
      ruta: "/admin/productos",
    },
  ];

  const modulos = [
    {
      icono: "👥",
      titulo: "Gestión de usuarios",
      descripcion: "Consulta y administra las cuentas, roles y estados del sistema.",
      ruta: "/admin/usuarios",
      textoBtn: "Gestionar Usuarios →",
      colorBtn: "bg-[#06b6d4] hover:bg-cyan-300 text-slate-950",
    },
    {
      icono: "🎮",
      titulo: "Gestión de productos",
      descripcion: "Actualiza el catálogo, precios, inventario e imágenes de los productos.",
      ruta: "/admin/productos",
      textoBtn: "Gestionar Productos →",
      colorBtn: "bg-emerald-400 hover:bg-emerald-300 text-slate-950",
    },
    {
      icono: "🛒",
      titulo: "Historial de Ventas & Facturación",
      descripcion: "Revisa los pedidos realizados por los clientes y descarga facturas en PDF.",
      ruta: "/admin/ventas",
      textoBtn: "Ver Ventas & Facturas →",
      colorBtn: "bg-indigo-400 hover:bg-indigo-300 text-slate-950",
    },
    {
      icono: "📩",
      titulo: "Atención a PQRS",
      descripcion: "Responde a las peticiones, quejas, reclamos y sugerencias de los clientes.",
      ruta: "/admin/pqrs",
      textoBtn: "Atender PQRS →",
      colorBtn: "bg-amber-400 hover:bg-amber-300 text-slate-950",
    },
  ];

  return (
    <div className="flex max-w-5xl mx-auto flex-col gap-6">
      {/* BIENVENIDA HERO */}
      <section className="border-b border-slate-800 pb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Resumen del Sistema</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Hola, <span className="text-[#06b6d4]">{usuario?.nombre}</span>
        </h1>
        <p className="mt-2 text-sm text-slate-300 sm:text-base max-w-2xl">
          Gestiona usuarios, productos, ventas y solicitudes de atención a clientes desde tu panel principal.
        </p>
      </section>

      {/* TARJETAS DE MÉTRICAS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metricas.map((m) => (
          <Link
            key={m.titulo}
            to={m.ruta}
            className={`rounded-2xl border ${m.borde} bg-gradient-to-br ${m.color} p-5 flex flex-col justify-between no-underline transition-transform hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{m.icono}</span>
              <span className="text-3xl font-black text-white">{m.valor}</span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-white">{m.titulo}</h3>
              <p className="text-xs text-slate-300 mt-0.5">{m.descripcion}</p>
            </div>
          </Link>
        ))}
      </section>

      {/* BARRA DE ESTADO DE INVENTARIO */}
      {!cargandoStats && totalProductos > 0 && (
        <section className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">Estado del inventario</h3>
              <p className="text-xs text-slate-400">Stock total disponible en catálogo activo</p>
            </div>
            <div className="flex gap-4">
              <span className="text-xs font-bold text-slate-300">
                Stock total: <span className="text-white">{stockTotal}</span> uds.
              </span>
              {productosBajoStock > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                  ⚠️ {productosBajoStock} producto{productosBajoStock !== 1 ? "s" : ""} con stock bajo (≤ 5)
                </span>
              )}
              {productosBajoStock === 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                  ✅ Stock en buen estado
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Activos: {productosActivos}</span>
              <span>Inactivos: {productosInactivos}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-700/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all"
                style={{ width: `${totalProductos > 0 ? (productosActivos / totalProductos) * 100 : 0}%` }}
              />
            </div>
          </div>
        </section>
      )}

      {/* MÓDULOS DE ADMINISTRACIÓN */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Módulos de Gestión</h2>
          <p className="text-xs text-slate-400">Accesos directos a la administración de tu tienda.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {modulos.map((modulo) => (
            <article
              key={modulo.titulo}
              className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 transition-colors hover:border-cyan-500/50 flex flex-col justify-between"
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
              </div>

              <Link
                to={modulo.ruta}
                className={`mt-5 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-black no-underline transition-transform hover:-translate-y-0.5 ${modulo.colorBtn}`}
              >
                {modulo.textoBtn}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminPanel;

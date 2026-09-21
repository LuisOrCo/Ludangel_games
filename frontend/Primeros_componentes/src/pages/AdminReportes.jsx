import { useEffect, useState } from "react";
import { API_URL } from "../config/api";

function AdminReportes() {
  const [topProductos, setTopProductos] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [cargando, setCargando] = useState(true);

  // REQ-04, REQ-05, REQ-06 State (Reporte Diario)
  const [fechaReporte, setFechaReporte] = useState(() => new Date().toISOString().split("T")[0]);
  const [reporteDiario, setReporteDiario] = useState(null);
  const [cargandoReporteDiario, setCargandoReporteDiario] = useState(false);

  // REQ-11 & REQ-13 State (Analítica + Filtros Avanzados)
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");
  const [filtroProducto, setFiltroProducto] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const [dataAnalitica, setDataAnalitica] = useState(null);
  const [cargandoAnalitica, setCargandoAnalitica] = useState(false);

  const token = localStorage.getItem("authToken") ?? sessionStorage.getItem("authToken");

  useEffect(() => {
    const cargarReportesIniciales = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [resDash, resTop] = await Promise.all([
          fetch(`${API_URL}/api/v1/reportes/dashboard`, { headers }).catch(() => null),
          fetch(`${API_URL}/api/v1/reportes/productos-mas-vendidos`, { headers }).catch(() => null),
        ]);

        if (resDash && resDash.ok) setDashboardData(await resDash.json());
        if (resTop && resTop.ok) setTopProductos(await resTop.json());
      } finally {
        setCargando(false);
      }
    };

    cargarReportesIniciales();
  }, [token]);

  // Cargar Reporte Diario
  useEffect(() => {
    const cargarReporteDiario = async () => {
      setCargandoReporteDiario(true);
      try {
        const res = await fetch(`${API_URL}/api/v1/reportes/diario?fecha=${fechaReporte}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setReporteDiario(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setCargandoReporteDiario(false);
      }
    };
    cargarReporteDiario();
  }, [fechaReporte, token]);

  // REQ-11 & REQ-13: Cargar Analítica con Filtros Avanzados
  const cargarAnalitica = async () => {
    setCargandoAnalitica(true);
    try {
      const params = new URLSearchParams();
      if (filtroFechaInicio) params.append("fecha_inicio", filtroFechaInicio);
      if (filtroFechaFin) params.append("fecha_fin", filtroFechaFin);
      if (filtroProducto) params.append("id_producto", filtroProducto);
      if (filtroCliente) params.append("id_cliente", filtroCliente);
      if (filtroEstado) params.append("estado", filtroEstado);

      const res = await fetch(`${API_URL}/api/v1/reportes/analitica?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDataAnalitica(await res.json());
      }
    } catch (err) {
      console.error("Error al cargar analítica:", err);
    } finally {
      setCargandoAnalitica(false);
    }
  };

  useEffect(() => {
    cargarAnalitica();
  }, [filtroFechaInicio, filtroFechaFin, filtroProducto, filtroCliente, filtroEstado, token]);

  const aplicarPresets = (tipo) => {
    const hoy = new Date();
    if (tipo === "hoy") {
      const str = hoy.toISOString().split("T")[0];
      setFiltroFechaInicio(str);
      setFiltroFechaFin(str);
    } else if (tipo === "semana") {
      const hace7Dias = new Date(hoy);
      hace7Dias.setDate(hace7Dias.getDate() - 7);
      setFiltroFechaInicio(hace7Dias.toISOString().split("T")[0]);
      setFiltroFechaFin(hoy.toISOString().split("T")[0]);
    } else if (tipo === "mes") {
      const hace30Dias = new Date(hoy);
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      setFiltroFechaInicio(hace30Dias.toISOString().split("T")[0]);
      setFiltroFechaFin(hoy.toISOString().split("T")[0]);
    } else if (tipo === "todo") {
      setFiltroFechaInicio("");
      setFiltroFechaFin("");
    }
  };

  const limpiarFiltros = () => {
    setFiltroFechaInicio("");
    setFiltroFechaFin("");
    setFiltroProducto("");
    setFiltroCliente("");
    setFiltroEstado("");
  };

  // REQ-05: PDF
  const exportarPDF = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/reportes/diario/pdf?fecha=${fechaReporte}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo generar el PDF.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_Diario_Ventas_${fechaReporte}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert(err.message);
    }
  };

  // REQ-06: Excel
  const exportarExcel = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/reportes/diario/excel?fecha=${fechaReporte}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo generar el Excel.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_Diario_Ventas_${fechaReporte}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert(err.message);
    }
  };

  // Cálculos para Gráficos SVG
  const maxIngresoLineal = Math.max(...(dataAnalitica?.grafico_lineal?.map(g => g.ingresos) || [1]), 1);
  const maxUnidadesBarras = Math.max(...(dataAnalitica?.grafico_barras?.map(b => b.unidades) || [1]), 1);

  return (
    <div className="flex max-w-6xl mx-auto flex-col gap-8 text-white pb-10">
      {/* HEADER */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white">Dashboards & Analítica de Ventas</h1>
        <p className="text-xs text-slate-400">
          Visualiza gráficos lineales, de barras e indicadores numéricos con filtros avanzados (REQ-11, REQ-13).
        </p>
      </div>

      {cargando ? (
        <p className="text-center text-sm text-slate-400 py-10">Cargando analítica del sistema...</p>
      ) : (
        <>
          {/* REQ-13: PANEL DE FILTROS AVANZADOS */}
          <section className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
              <h2 className="text-sm font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                🔍 REQ-13 · Filtros del Dashboard
              </h2>
              <div className="flex flex-wrap gap-2 text-xs">
                <button onClick={() => aplicarPresets("hoy")} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold">Hoy</button>
                <button onClick={() => aplicarPresets("semana")} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold">Última Semana</button>
                <button onClick={() => aplicarPresets("mes")} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold">Último Mes</button>
                <button onClick={() => aplicarPresets("todo")} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold">Todo</button>
                <button onClick={limpiarFiltros} className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 font-bold ml-2">🧹 Limpiar</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Fecha Inicial:</label>
                <input
                  type="date"
                  value={filtroFechaInicio}
                  onChange={(e) => setFiltroFechaInicio(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Fecha Final:</label>
                <input
                  type="date"
                  value={filtroFechaFin}
                  onChange={(e) => setFiltroFechaFin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Filtrar por Producto:</label>
                <select
                  value={filtroProducto}
                  onChange={(e) => setFiltroProducto(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white focus:border-cyan-500 outline-none"
                >
                  <option value="">Todos los productos</option>
                  {dataAnalitica?.opciones_filtro?.productos?.map((p) => (
                    <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Filtrar por Cliente:</label>
                <select
                  value={filtroCliente}
                  onChange={(e) => setFiltroCliente(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white focus:border-cyan-500 outline-none"
                >
                  <option value="">Todos los clientes</option>
                  {dataAnalitica?.opciones_filtro?.clientes?.map((c) => (
                    <option key={c.id_usuario} value={c.id_usuario}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Estado de la Venta:</label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white focus:border-cyan-500 outline-none"
                >
                  <option value="">Todos los estados</option>
                  <option value="Completada">Completada</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
            </div>
          </section>

          {/* REQ-11: INDICADORES NUMÉRICOS EN CARDS */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 p-5">
              <span className="text-2xl">💰</span>
              <p className="mt-2 text-xs font-bold text-indigo-300 uppercase">Ingresos Recaudados</p>
              <p className="text-2xl font-black text-white mt-1">
                ${(dataAnalitica?.cards?.ingresos_totales ?? 0).toLocaleString()} COP
              </p>
              <span className="text-[10px] text-slate-400">Total según filtros aplicados</span>
            </div>

            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 p-5">
              <span className="text-2xl">🛒</span>
              <p className="mt-2 text-xs font-bold text-cyan-300 uppercase">Ventas Realizadas</p>
              <p className="text-2xl font-black text-white mt-1">
                {dataAnalitica?.cards?.total_ventas ?? 0} pedidos
              </p>
              <span className="text-[10px] text-slate-400">Cantidad de transacciones</span>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 p-5">
              <span className="text-2xl">📦</span>
              <p className="mt-2 text-xs font-bold text-emerald-300 uppercase">Unidades Vendidas</p>
              <p className="text-2xl font-black text-white mt-1">
                {dataAnalitica?.cards?.unidades_vendidas ?? 0}uds.
              </p>
              <span className="text-[10px] text-slate-400">Volumen de productos</span>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-orange-500/10 p-5">
              <span className="text-2xl">📈</span>
              <p className="mt-2 text-xs font-bold text-amber-300 uppercase">Promedio por Venta</p>
              <p className="text-2xl font-black text-white mt-1">
                ${Math.round(dataAnalitica?.cards?.promedio_venta ?? 0).toLocaleString()} COP
              </p>
              <span className="text-[10px] text-slate-400">Ticket promedio</span>
            </div>
          </section>

          {/* REQ-11: VISUALIZACIÓN ANALÍTICA DE GRÁFICOS (GRÁFICO LINEAL & BARRAS) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. GRÁFICO LINEAL DE TENDENCIA DE INGRESOS */}
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 space-y-4">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  📈 Tendencia Diaria de Ingresos (Gráfico Lineal)
                </h2>
                <p className="text-xs text-slate-400">Comportamiento financiero en el tiempo.</p>
              </div>

              {cargandoAnalitica ? (
                <p className="py-12 text-center text-xs text-slate-400">Cargando gráfico...</p>
              ) : !dataAnalitica?.grafico_lineal || dataAnalitica.grafico_lineal.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500 border border-slate-800 rounded-xl bg-slate-900/50">
                  Sin datos suficientes para trazar el gráfico lineal.
                </div>
              ) : (
                <div className="pt-2">
                  {/* SVG LINE CHART - GRÁFICO LINEAL DE TENDENCIA */}
                  {(() => {
                    const puntos = dataAnalitica.grafico_lineal;
                    const maxV = Math.max(...puntos.map((p) => p.ingresos), 1);
                    const width = 500;
                    const height = 170;
                    const pLeft = 40;
                    const pRight = 460;
                    const pTop = 20;
                    const pBottom = 140;
                    const chartH = pBottom - pTop;

                    const coords = puntos.map((p, idx) => {
                      const x =
                        puntos.length === 1
                          ? (pLeft + pRight) / 2
                          : pLeft + (idx / (puntos.length - 1)) * (pRight - pLeft);
                      const y = pBottom - (p.ingresos / maxV) * chartH;
                      return { ...p, x, y };
                    });

                    // Construcción de ruta de la línea (d)
                    let dPath = "";
                    if (coords.length === 1) {
                      dPath = `M ${pLeft} ${coords[0].y} L ${pRight} ${coords[0].y}`;
                    } else {
                      dPath = coords.reduce(
                        (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
                        ""
                      );
                    }

                    // Ruta de relleno inferior (área con degradado)
                    const areaPath =
                      coords.length === 1
                        ? `M ${pLeft} ${coords[0].y} L ${pRight} ${coords[0].y} L ${pRight} ${pBottom} L ${pLeft} ${pBottom} Z`
                        : `${dPath} L ${coords[coords.length - 1].x} ${pBottom} L ${coords[0].x} ${pBottom} Z`;

                    return (
                      <div className="relative w-full">
                        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-52 overflow-visible">
                          <defs>
                            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#06b6d4" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* LÍNEAS DE GUÍA HORIZONTALES */}
                          <line x1={pLeft} y1={pTop} x2={pRight} y2={pTop} stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />
                          <line x1={pLeft} y1={(pTop + pBottom) / 2} x2={pRight} y2={(pTop + pBottom) / 2} stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />
                          <line x1={pLeft} y1={pBottom} x2={pRight} y2={pBottom} stroke="#475569" strokeWidth="1.2" />

                          {/* RELLENO SOMBREADO */}
                          <path d={areaPath} fill="url(#areaGrad)" />

                          {/* LÍNEA DE TENDENCIA */}
                          <path d={dPath} fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                          {/* PUNTOS NODALES */}
                          {coords.map((pt, i) => (
                            <g key={i} className="group cursor-pointer">
                              <circle cx={pt.x} cy={pt.y} r="6" fill="#06b6d4" stroke="#0f172a" strokeWidth="2.5" className="transition-transform group-hover:scale-150" />
                              {/* Valor sobre el punto */}
                              <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                                ${Math.round(pt.ingresos / 1000)}k
                              </text>
                              {/* Etiqueta de Fecha Abajo */}
                              <text x={pt.x} y={pBottom + 16} textAnchor="middle" fill="#94a3b8" fontSize="9">
                                {pt.etiqueta.split("-").slice(1).join("/")}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* 2. GRÁFICO DE BARRAS DE PRODUCTOS */}
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 space-y-4">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  📊 Ventas por Producto (Gráfico de Barras)
                </h2>
                <p className="text-xs text-slate-400">Comparativa de unidades vendidas por producto.</p>
              </div>

              {cargandoAnalitica ? (
                <p className="py-12 text-center text-xs text-slate-400">Cargando gráfico...</p>
              ) : !dataAnalitica?.grafico_barras || dataAnalitica.grafico_barras.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500 border border-slate-800 rounded-xl bg-slate-900/50">
                  Sin datos suficientes para mostrar el gráfico de barras.
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {dataAnalitica.grafico_barras.map((b, idx) => {
                    const pctBarra = Math.max(8, (b.unidades / maxUnidadesBarras) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-white truncate max-w-[220px]">{b.etiqueta}</span>
                          <span className="text-emerald-400 font-bold">{b.unidades} uds. (${b.ingresos.toLocaleString()})</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                            style={{ width: `${pctBarra}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* REQ-04, REQ-05, REQ-06: MÓDULO DE REPORTE DIARIO DE VENTAS CON EXPORTACIÓN */}
          <div className="rounded-2xl border border-cyan-500/30 bg-[#0f172a] p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold text-cyan-300 uppercase">
                  📊 REQ-04 · Reporte Diario
                </span>
                <h2 className="text-lg font-black text-white mt-2">Reporte Diario de Ventas</h2>
                <p className="text-xs text-slate-400">
                  Selecciona la fecha para consultar las ventas registradas y exportar los informes oficiales.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="date"
                  value={fechaReporte}
                  onChange={(e) => setFechaReporte(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-bold text-white focus:border-cyan-500 outline-none"
                />

                <button
                  onClick={exportarPDF}
                  className="rounded-xl bg-red-500 hover:bg-red-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition-all flex items-center gap-1.5 shadow-lg shadow-red-500/20 cursor-pointer"
                >
                  📄 Exportar PDF (REQ-05)
                </button>

                <button
                  onClick={exportarExcel}
                  className="rounded-xl bg-emerald-400 hover:bg-emerald-300 px-3.5 py-2 text-xs font-bold text-slate-950 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  📊 Exportar Excel (REQ-06)
                </button>
              </div>
            </div>

            {cargandoReporteDiario ? (
              <p className="text-center text-xs text-slate-400 py-6">Cargando reporte del día...</p>
            ) : !reporteDiario || reporteDiario.ventas?.length === 0 ? (
              <div className="rounded-xl bg-slate-900/60 p-8 text-center text-xs text-slate-400 border border-slate-800">
                📅 No se encontraron ventas registradas para la fecha: <strong>{fechaReporte}</strong>.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-slate-300">
                    Ventas del día: <strong className="text-white">{reporteDiario.total_ventas}</strong>
                  </span>
                  <span className="font-bold text-emerald-400 text-sm">
                    Total Recaudado: ${reporteDiario.total_recaudado.toLocaleString()} COP
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="border-b border-slate-800 bg-slate-900 uppercase text-[11px] font-bold text-slate-400">
                      <tr>
                        <th className="p-3">N° Venta</th>
                        <th className="p-3">Hora</th>
                        <th className="p-3">Cliente</th>
                        <th className="p-3">Productos / Cantidad</th>
                        <th className="p-3">Método Pago</th>
                        <th className="p-3">Total (COP)</th>
                        <th className="p-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                      {reporteDiario.ventas.map((v) => (
                        <tr key={v.id_venta} className="hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-cyan-400">#{v.id_venta.toString().padStart(6, "0")}</td>
                          <td className="p-3">{v.fecha.split(" ")[1] || v.fecha}</td>
                          <td className="p-3 font-medium text-white">
                            {v.cliente}
                            <span className="block text-[10px] text-slate-400">{v.correo}</span>
                          </td>
                          <td className="p-3 max-w-xs truncate text-slate-300">{v.items}</td>
                          <td className="p-3 font-semibold text-slate-200">{v.metodo_pago}</td>
                          <td className="p-3 font-black text-emerald-400">${v.total.toLocaleString()}</td>
                          <td className="p-3">
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                              {v.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminReportes;

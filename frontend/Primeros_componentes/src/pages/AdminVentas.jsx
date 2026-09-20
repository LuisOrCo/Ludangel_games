import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function AdminVentas() {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  const token = localStorage.getItem("authToken") ?? sessionStorage.getItem("authToken");

  const cargarVentas = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/ventas/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVentas(data.ventas ?? []);
      }
    } catch (err) {
      console.error("Error al cargar ventas:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  const descargarFactura = async (idVenta) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/ventas/${idVenta}/factura-pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("No se pudo descargar la factura");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Factura_LudAngel_${idVenta}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert(err.message);
    }
  };

  const ventasFiltradas = ventas.filter((v) => {
    const texto = `${v.id_venta} ${v.usuario?.nombre ?? ''} ${v.usuario?.apellido ?? ''} ${v.usuario?.correo ?? ''} ${v.metodo_pago}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div className="flex max-w-6xl mx-auto flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Historial de Ventas & Facturación</h1>
          <p className="text-xs text-slate-400">Consulta las compras realizadas por clientes y descarga sus facturas oficiales en PDF.</p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Buscar por N° venta, cliente, correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full sm:w-72 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {cargando ? (
        <p className="text-center text-sm text-slate-400 py-10">Cargando ventas...</p>
      ) : ventasFiltradas.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-12 text-center text-slate-400">
          🛒 No hay ventas registradas que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0f172a]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/60 uppercase text-[11px] font-bold text-slate-400">
              <tr>
                <th className="p-4">N° Factura</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Método de Pago</th>
                <th className="p-4">Total</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {ventasFiltradas.map((v) => (
                <tr key={v.id_venta} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-cyan-400">#{v.id_venta.toString().padStart(6, "0")}</td>
                  <td className="p-4 font-medium text-white">
                    {v.usuario ? `${v.usuario.nombre} ${v.usuario.apellido}` : "Cliente General"}
                    <span className="block text-[10px] text-slate-400">{v.usuario?.correo}</span>
                  </td>
                  <td className="p-4">{new Date(v.fecha_venta).toLocaleString()}</td>
                  <td className="p-4 font-semibold text-slate-200">{v.metodo_pago}</td>
                  <td className="p-4 font-black text-emerald-400 text-sm">${v.total.toLocaleString()}</td>
                  <td className="p-4">
                    <span className="inline-block rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                      {v.estado}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setVentaSeleccionada(v)}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-[11px] font-bold text-slate-200 hover:bg-slate-700 transition-colors"
                      >
                        👁️ Ver Detalle
                      </button>
                      <button
                        onClick={() => descargarFactura(v.id_venta)}
                        className="rounded-lg bg-cyan-500 hover:bg-cyan-400 px-2.5 py-1.5 text-[11px] font-bold text-slate-950 transition-colors"
                      >
                        📄 Factura PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DETALLE DE VENTA */}
      {ventaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-cyan-400">
                Detalle de Venta #{ventaSeleccionada.id_venta.toString().padStart(6, "0")}
              </h3>
              <button
                onClick={() => setVentaSeleccionada(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <p><strong>Cliente:</strong> {ventaSeleccionada.usuario?.nombre} {ventaSeleccionada.usuario?.apellido} ({ventaSeleccionada.usuario?.correo})</p>
              <p><strong>Método de Pago:</strong> {ventaSeleccionada.metodo_pago}</p>
              <p><strong>Fecha:</strong> {new Date(ventaSeleccionada.fecha_venta).toLocaleString()}</p>

              <div className="mt-4 border-t border-slate-800 pt-3">
                <p className="font-bold text-slate-300 mb-2">Ítems comprados:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {ventaSeleccionada.detalles?.map((d) => (
                    <div key={d.id_detalle} className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded-xl">
                      <div>
                        <p className="font-bold text-white">{d.producto?.nombre ?? `Producto #${d.id_producto}`}</p>
                        <p className="text-[11px] text-slate-400">Cantidad: {d.cantidad} x ${d.precio_unitario.toLocaleString()}</p>
                      </div>
                      <span className="font-bold text-emerald-400">${d.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-black border-t border-slate-800 pt-3">
                <span>TOTAL:</span>
                <span className="text-emerald-400 text-lg">${ventaSeleccionada.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setVentaSeleccionada(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
              >
                Cerrar
              </button>
              <button
                onClick={() => descargarFactura(ventaSeleccionada.id_venta)}
                className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950"
              >
                📄 Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminVentas;

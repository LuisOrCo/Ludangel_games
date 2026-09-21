import { useEffect, useState } from "react";
import { API_URL } from "../config/api";

function AdminPQRS() {
  const [pqrs, setPqrs] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [pqrResponder, setPqrResponder] = useState(null);
  const [respuestaTexto, setRespuestaTexto] = useState("");
  const [estadoNuevo, setEstadoNuevo] = useState("Resuelto");
  const [guardando, setGuardando] = useState(false);

  const token = localStorage.getItem("authToken") ?? sessionStorage.getItem("authToken");

  const cargarPQRS = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/pqrs/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPqrs(data.pqrs ?? []);
      }
    } catch (err) {
      console.error("Error al cargar PQRS:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPQRS();
  }, []);

  const abrirModalResponder = (pqr) => {
    setPqrResponder(pqr);
    setRespuestaTexto(pqr.respuesta ?? "");
    setEstadoNuevo(pqr.estado === "Pendiente" ? "Resuelto" : pqr.estado);
  };

  const enviarRespuesta = async (e) => {
    e.preventDefault();
    if (!respuestaTexto.trim()) {
      alert("Por favor escribe una respuesta para el cliente.");
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/pqrs/${pqrResponder.id_pqr}/responder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          respuesta: respuestaTexto,
          estado: estadoNuevo
        })
      });

      if (!res.ok) throw new Error("No se pudo guardar la respuesta.");

      alert("Respuesta guardada con éxito.");
      setPqrResponder(null);
      cargarPQRS();
    } catch (err) {
      alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const pqrsFiltradas = pqrs.filter((p) => {
    const texto = `${p.id_pqr} ${p.tipo} ${p.asunto} ${p.descripcion} ${p.usuario?.nombre ?? ''} ${p.usuario?.correo ?? ''}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div className="flex max-w-6xl mx-auto flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Atención a Solicitudes PQRS</h1>
          <p className="text-xs text-slate-400">Peticiones, Quejas, Reclamos y Sugerencias radicadas por los clientes.</p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Buscar por N° PQR, asunto, cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full sm:w-72 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {cargando ? (
        <p className="text-center text-sm text-slate-400 py-10">Cargando solicitudes...</p>
      ) : pqrsFiltradas.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-12 text-center text-slate-400">
          📩 No hay solicitudes PQRS registradas que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0f172a]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/60 uppercase text-[11px] font-bold text-slate-400">
              <tr>
                <th className="p-4">N° PQR</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Asunto</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {pqrsFiltradas.map((p) => (
                <tr key={p.id_pqr} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-amber-400">#{p.id_pqr}</td>
                  <td className="p-4">
                    <span className="inline-block rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                      {p.tipo}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-white">
                    {p.usuario ? `${p.usuario.nombre} ${p.usuario.apellido}` : "Cliente"}
                    <span className="block text-[10px] text-slate-400">{p.usuario?.correo}</span>
                  </td>
                  <td className="p-4 max-w-xs truncate font-semibold text-slate-200">{p.asunto}</td>
                  <td className="p-4">{new Date(p.fecha_creacion).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                        p.estado === "Pendiente"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : p.estado === "Resuelto"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                      }`}
                    >
                      {p.estado}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => abrirModalResponder(p)}
                      className="rounded-lg bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-[11px] font-bold text-slate-950 transition-colors"
                    >
                      💬 {p.respuesta ? "Editar Respuesta" : "Responder"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL RESPONDER PQR */}
      {pqrResponder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-amber-400">
                Atender PQR #{pqrResponder.id_pqr} ({pqrResponder.tipo})
              </h3>
              <button
                onClick={() => setPqrResponder(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={enviarRespuesta} className="my-4 space-y-4 text-xs">
              <div className="rounded-xl bg-slate-800/80 p-3 space-y-1">
                <p><strong>Cliente:</strong> {pqrResponder.usuario?.nombre} {pqrResponder.usuario?.apellido} ({pqrResponder.usuario?.correo})</p>
                <p><strong>Asunto:</strong> {pqrResponder.asunto}</p>
                <p className="mt-2 text-slate-300 font-medium whitespace-pre-wrap">
                  "{pqrResponder.descripcion}"
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Estado de la Solicitud:</label>
                <select
                  value={estadoNuevo}
                  onChange={(e) => setEstadoNuevo(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Resuelto">Resuelto</option>
                  <option value="Cerrado">Cerrado</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Respuesta Oficial para el Cliente:</label>
                <textarea
                  rows={4}
                  value={respuestaTexto}
                  onChange={(e) => setRespuestaTexto(e.target.value)}
                  placeholder="Escribe la respuesta detallada para el cliente..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-xs text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPqrResponder(null)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors"
                >
                  {guardando ? "Guardando..." : "Guardar y Notificar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPQRS;

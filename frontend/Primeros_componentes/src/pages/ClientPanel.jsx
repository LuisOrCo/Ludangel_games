import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function ClientPanel() {
  const [tabActiva, setTabActiva] = useState("perfil"); // "perfil", "compras", "pqrs"
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Mis Compras State
  const [ventas, setVentas] = useState([]);
  const [cargandoVentas, setCargandoVentas] = useState(false);

  // Mis PQRS State
  const [pqrs, setPqrs] = useState([]);
  const [cargandoPqrs, setCargandoPqrs] = useState(false);
  const [nuevaPqr, setNuevaPqr] = useState({ tipo: "Peticion", asunto: "", descripcion: "" });
  const [enviandoPqr, setEnviandoPqr] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    tipo_documento: "CC",
    numero_documento: "",
    direccion: "",
    telefono: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
  });

  const getAuthToken = () => {
    return localStorage.getItem("authToken") ?? sessionStorage.getItem("authToken");
  };

  const cargarPerfil = async () => {
    setLoading(true);
    setError("");
    const token = getAuthToken();

    try {
      const response = await fetch(`${API_URL}/api/v1/usuarios/perfil`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Error al obtener perfil.");

      setPerfil(data.usuario);
      setFormData({
        nombre: data.usuario.nombre || "",
        apellido: data.usuario.apellido || "",
        tipo_documento: data.usuario.tipo_documento || "CC",
        numero_documento: data.usuario.numero_documento || "",
        direccion: data.usuario.direccion || "",
        telefono: data.usuario.telefono || "",
        correo: data.usuario.correo || "",
        contrasena: "",
        confirmarContrasena: "",
      });
    } catch (err) {
      setError(err.message ?? "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const cargarMisVentas = async () => {
    setCargandoVentas(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/v1/ventas/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVentas(data.ventas ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoVentas(false);
    }
  };

  const cargarMisPqrs = async () => {
    setCargandoPqrs(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/v1/pqrs/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPqrs(data.pqrs ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoPqrs(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  useEffect(() => {
    if (tabActiva === "compras") cargarMisVentas();
    if (tabActiva === "pqrs") cargarMisPqrs();
  }, [tabActiva]);

  const descargarFactura = async (idVenta) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/v1/ventas/${idVenta}/factura-pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("No se pudo descargar la factura.");

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

  const radicarPqr = async (e) => {
    e.preventDefault();
    if (!nuevaPqr.asunto.trim() || !nuevaPqr.descripcion.trim()) {
      alert("Por favor completa el asunto y la descripción de la solicitud.");
      return;
    }

    setEnviandoPqr(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/v1/pqrs/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(nuevaPqr)
      });

      if (!res.ok) throw new Error("No se pudo registrar la solicitud.");

      alert("¡Tu PQR ha sido radicada con éxito! Te responderemos muy pronto.");
      setNuevaPqr({ tipo: "Peticion", asunto: "", descripcion: "" });
      cargarMisPqrs();
    } catch (err) {
      alert(err.message);
    } finally {
      setEnviandoPqr(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.contrasena) {
      if (formData.contrasena.length < 9) {
        setError("La nueva contraseña debe tener al menos 9 caracteres.");
        return;
      }
      if (formData.contrasena !== formData.confirmarContrasena) {
        setError("Las contraseñas ingresadas no coinciden.");
        return;
      }
    }

    setIsSubmitting(true);
    const token = getAuthToken();

    const payload = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      tipo_documento: formData.tipo_documento,
      numero_documento: formData.numero_documento.trim(),
      direccion: formData.direccion.trim(),
      telefono: formData.telefono.trim(),
      correo: formData.correo.trim(),
    };

    if (formData.contrasena) {
      payload.contrasena = formData.contrasena;
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/usuarios/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Error al actualizar la información.");

      setPerfil(data.usuario);
      setSuccess("¡Tus datos han sido actualizados correctamente!");
      setModoEdicion(false);

      const storage = localStorage.getItem("authToken") ? localStorage : sessionStorage;
      const storedUser = JSON.parse(storage.getItem("authUser") || "{}");
      storage.setItem("authUser", JSON.stringify({ ...storedUser, nombre: data.usuario.nombre, apellido: data.usuario.apellido, correo: data.usuario.correo }));
      window.dispatchEvent(new Event("authChanged"));
    } catch (err) {
      setError(err.message ?? "No se pudo actualizar el perfil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "N/A";
    try {
      return new Date(fechaStr).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return fechaStr;
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-7xl items-center justify-center py-24 px-6">
        <div className="flex flex-col items-center gap-4 text-cyan-400">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Cargando tu información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 sm:py-14 text-white">
      {/* HEADER SECTION */}
      <section className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/15 via-[#0f172a] to-[#0f172a] p-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
              👤 Mi Cuenta - Cliente
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Bienvenido, <span className="text-[#06b6d4]">{perfil?.nombre} {perfil?.apellido}</span>
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Consulta tus compras, descarga tus facturas en PDF y gestiona tu información.
            </p>
          </div>
        </div>

        {/* NAVEGACIÓN PESTAÑAS */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-800/80 pt-4">
          <button
            onClick={() => setTabActiva("perfil")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              tabActiva === "perfil"
                ? "bg-cyan-500 text-slate-950 font-black"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            👤 Mi Perfil
          </button>
          <button
            onClick={() => setTabActiva("compras")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              tabActiva === "compras"
                ? "bg-cyan-500 text-slate-950 font-black"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            🛒 Mis Compras & Facturas
          </button>
          <button
            onClick={() => setTabActiva("pqrs")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              tabActiva === "pqrs"
                ? "bg-cyan-500 text-slate-950 font-black"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            📩 Atencion al Cliente / PQRS
          </button>
        </div>
      </section>

      {/* ALERTS */}
      {success && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-300 flex items-center justify-between">
          <span>✅ {success}</span>
          <button onClick={() => setSuccess("")} className="text-emerald-300 font-bold ml-4">✕</button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300 flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError("")} className="text-red-300 font-bold ml-4">✕</button>
        </div>
      )}

      {/* TAB 1: MI PERFIL */}
      {tabActiva === "perfil" && (
        <div>
          {!modoEdicion ? (
            <div className="grid gap-6 md:grid-cols-2">
              <article className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">🪪 Datos Personales</h2>
                    <button
                      onClick={() => setModoEdicion(true)}
                      className="text-xs font-bold text-cyan-400 hover:underline"
                    >
                      ✏️ Editar
                    </button>
                  </div>
                  <div className="mt-5 space-y-4 text-sm">
                    <div>
                      <span className="text-xs uppercase text-slate-400 font-medium">Nombre Completo</span>
                      <p className="text-base font-semibold text-white mt-0.5">{perfil?.nombre} {perfil?.apellido}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs uppercase text-slate-400 font-medium">Documento</span>
                        <p className="text-base font-semibold text-white mt-0.5">{perfil?.tipo_documento} {perfil?.numero_documento}</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase text-slate-400 font-medium">Fecha de Registro</span>
                        <p className="text-base font-semibold text-white mt-0.5">{formatearFecha(perfil?.fecha_creacion)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-xl">
                <div className="pb-4 border-b border-slate-800">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">📱 Contacto</h2>
                </div>
                <div className="mt-5 space-y-4 text-sm">
                  <div>
                    <span className="text-xs uppercase text-slate-400 font-medium">Correo Electrónico</span>
                    <p className="text-base font-semibold text-white mt-0.5">{perfil?.correo}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-slate-400 font-medium">Teléfono / Celular</span>
                    <p className="text-base font-semibold text-white mt-0.5">{perfil?.telefono}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-slate-400 font-medium">Dirección de Residencia</span>
                    <p className="text-base font-semibold text-white mt-0.5">{perfil?.direccion}</p>
                  </div>
                </div>
              </article>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-xl space-y-6">
              <h2 className="text-xl font-bold text-white pb-3 border-b border-slate-800">✏️ Actualizar Información</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm" />
                <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm" />
                <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} required className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm" />
                <input type="email" name="correo" value={formData.correo} onChange={handleChange} required className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm" />
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} required className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm md:col-span-2" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setModoEdicion(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold">Guardar</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: MIS COMPRAS & FACTURAS */}
      {tabActiva === "compras" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white">🛒 Historial de Mis Compras</h2>
            <p className="text-xs text-slate-400">Descarga la factura en PDF de cualquiera de tus compras.</p>
          </div>

          {cargandoVentas ? (
            <p className="text-center text-sm text-slate-400 py-8">Cargando tus compras...</p>
          ) : ventas.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-10 text-center text-slate-400">
              Aún no has realizado ninguna compra en nuestra tienda. ¡Visita el catálogo de productos!
            </div>
          ) : (
            <div className="grid gap-4">
              {ventas.map((v) => (
                <div key={v.id_venta} className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-400 text-sm">Factura #{v.id_venta.toString().padStart(6, "0")}</span>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">{v.estado}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Fecha: {new Date(v.fecha_venta).toLocaleString()} | Método: {v.metodo_pago}</p>
                    <div className="mt-2 text-xs text-slate-300">
                      {v.detalles?.map(d => (
                        <span key={d.id_detalle} className="inline-block mr-3 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                          {d.producto?.nombre} (x{d.cantidad})
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-black text-emerald-400">${v.total.toLocaleString()}</span>
                    <button
                      onClick={() => descargarFactura(v.id_venta)}
                      className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition-colors"
                    >
                      📄 Factura PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MIS PQRS */}
      {tabActiva === "pqrs" && (
        <div className="space-y-6">
          {/* FORMULARIO RADICAR PQR */}
          <form onSubmit={radicarPqr} className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">✍️ Radicar Nueva Solicitud (PQR)</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1">Tipo de Solicitud:</label>
                <select
                  value={nuevaPqr.tipo}
                  onChange={(e) => setNuevaPqr({ ...nuevaPqr, tipo: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="Peticion">Petición</option>
                  <option value="Queja">Queja</option>
                  <option value="Reclamo">Reclamo</option>
                  <option value="Sugerencia">Sugerencia</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1">Asunto:</label>
                <input
                  type="text"
                  placeholder="Ej: Garantía de producto o consulta..."
                  value={nuevaPqr.asunto}
                  onChange={(e) => setNuevaPqr({ ...nuevaPqr, asunto: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-300 font-bold mb-1">Detalle de tu Petición/Reclamo:</label>
                <textarea
                  rows={3}
                  placeholder="Describe con claridad lo sucedido..."
                  value={nuevaPqr.descripcion}
                  onChange={(e) => setNuevaPqr({ ...nuevaPqr, descripcion: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={enviandoPqr}
                className="rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 transition-colors"
              >
                {enviandoPqr ? "Radicando..." : "🚀 Radicar PQR"}
              </button>
            </div>
          </form>

          {/* LISTADO DE MIS PQRS */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">📩 Estado de mis Solicitudes</h3>
            {cargandoPqrs ? (
              <p className="text-center text-xs text-slate-400 py-6">Cargando tus solicitudes...</p>
            ) : pqrs.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-8 text-center text-xs text-slate-400">
                No has radicado ninguna PQR hasta el momento.
              </div>
            ) : (
              <div className="space-y-3">
                {pqrs.map((p) => (
                  <div key={p.id_pqr} className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400 text-sm">PQR #{p.id_pqr}</span>
                        <span className="bg-slate-800 px-2 py-0.5 text-[10px] font-semibold rounded text-slate-300">{p.tipo}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${p.estado === 'Pendiente' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                        {p.estado}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white">{p.asunto}</p>
                    <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl">"{p.descripcion}"</p>
                    {p.respuesta && (
                      <div className="mt-2 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
                        <p className="text-xs font-bold text-emerald-300">💬 Respuesta de Atención al Cliente:</p>
                        <p className="text-xs text-slate-200 mt-1">{p.respuesta}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientPanel;

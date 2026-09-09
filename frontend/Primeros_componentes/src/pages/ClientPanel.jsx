import { useEffect, useState } from "react";

function ClientPanel() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api/v1/usuarios/perfil`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "No se pudo obtener la información de la cuenta.");
      }

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

  useEffect(() => {
    cargarPerfil();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.nombre.trim() ||
      !formData.apellido.trim() ||
      !formData.tipo_documento ||
      !formData.numero_documento.trim() ||
      !formData.direccion.trim() ||
      !formData.telefono.trim() ||
      !formData.correo.trim()
    ) {
      setError("Todos los campos obligatorios deben estar diligenciados.");
      return;
    }

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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api/v1/usuarios/perfil`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Error al actualizar la información.");
      }

      setPerfil(data.usuario);
      setSuccess("¡Tus datos han sido actualizados correctamente!");
      setModoEdicion(false);

      // Actualizar el almacenamiento local/sesión y notificar cambios
      const storage = localStorage.getItem("authToken") ? localStorage : sessionStorage;
      const storedUser = JSON.parse(storage.getItem("authUser") || "{}");
      const updatedUser = {
        ...storedUser,
        nombre: data.usuario.nombre,
        apellido: data.usuario.apellido,
        correo: data.usuario.correo,
      };
      storage.setItem("authUser", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("authChanged"));

      setFormData((prev) => ({
        ...prev,
        contrasena: "",
        confirmarContrasena: "",
      }));
    } catch (err) {
      setError(err.message ?? "No se pudo actualizar el perfil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "N/A";
    try {
      return new Date(fechaStr).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return fechaStr;
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-7xl items-center justify-center py-24 px-6">
        <div className="flex flex-col items-center gap-4 text-cyan-400">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-300">Cargando tu información personal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 sm:py-14">
      {/* HEADER SECTION */}
      <section className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/15 via-[#0f172a] to-[#0f172a] p-8 shadow-xl shadow-cyan-500/5 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
              👤 Mi Cuenta - Cliente
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Bienvenido, <span className="text-[#06b6d4]">{perfil?.nombre} {perfil?.apellido}</span>
            </h1>
            <p className="mt-2 text-sm text-slate-300 sm:text-base">
              Gestiona tu información personal guardada en nuestra base de datos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setModoEdicion(!modoEdicion);
              setError("");
              setSuccess("");
            }}
            className={`rounded-xl px-5 py-3 text-sm font-bold shadow-lg transition-all cursor-pointer flex items-center gap-2 ${
              modoEdicion
                ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                : "bg-gradient-to-r from-[#06b6d4] to-[#0284c7] hover:from-[#22d3ee] hover:to-[#0369a1] text-slate-950 shadow-cyan-500/20"
            }`}
          >
            <span>{modoEdicion ? "👁️ Ver Mi Información" : "✏️ Editar Mi Información"}</span>
          </button>
        </div>
      </section>

      {/* ALERT FEEDBACK */}
      {success && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-300 flex items-center justify-between animate-fade-in">
          <span>✅ {success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            className="text-emerald-300 hover:text-white text-xs cursor-pointer font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300 flex items-center justify-between animate-fade-in">
          <span>⚠️ {error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-300 hover:text-white text-xs cursor-pointer font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* CONTENT AREA */}
      {!modoEdicion ? (
        /* LECTURA DE INFORMACIÓN */
        <div className="grid gap-6 md:grid-cols-2">
          {/* TARJETA DATOS PERSONALES */}
          <article className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <span className="text-2xl">🪪</span>
                <h2 className="text-xl font-bold text-white">Datos Personales</h2>
              </div>
              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 block font-medium">Nombre Completo</span>
                  <p className="text-base font-semibold text-white mt-0.5">{perfil?.nombre} {perfil?.apellido}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-400 block font-medium">Tipo de Documento</span>
                    <p className="text-base font-semibold text-white mt-0.5">{perfil?.tipo_documento}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-400 block font-medium">N° de Documento</span>
                    <p className="text-base font-semibold text-white mt-0.5">{perfil?.numero_documento}</p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* TARJETA DATOS DE CONTACTO Y CUENTA */}
          <article className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <span className="text-2xl">📱</span>
                <h2 className="text-xl font-bold text-white">Contacto y Estado</h2>
              </div>
              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 block font-medium">Correo Electrónico</span>
                  <p className="text-base font-semibold text-white mt-0.5">{perfil?.correo}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-400 block font-medium">Teléfono</span>
                    <p className="text-base font-semibold text-white mt-0.5">{perfil?.telefono}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-400 block font-medium">Estado de Cuenta</span>
                    <span className="inline-block mt-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/30">
                      ● Activa
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 block font-medium">Dirección de Residencia</span>
                  <p className="text-base font-semibold text-white mt-0.5">{perfil?.direccion}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 block font-medium">Fecha de Registro</span>
                  <p className="text-sm text-slate-300 mt-0.5">{formatearFecha(perfil?.fecha_creacion)}</p>
                </div>
              </div>
            </div>
          </article>
        </div>
      ) : (
        /* EDICIÓN DE INFORMACIÓN */
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <span className="text-2xl">✏️</span>
            <div>
              <h2 className="text-xl font-bold text-white">Actualizar Información Guardada</h2>
              <p className="text-xs text-slate-400">Modifica tus datos personales guardados en el sistema.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* NOMBRE */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Nombre <span className="text-[#06b6d4]">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="bg-[#0b1120] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all"
              />
            </div>

            {/* APELLIDO */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Apellido <span className="text-[#06b6d4]">*</span>
              </label>
              <input
                type="text"
                name="apellido"
                required
                value={formData.apellido}
                onChange={handleChange}
                className="bg-[#0b1120] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all"
              />
            </div>

            {/* TIPO DE DOCUMENTO */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Tipo de Documento <span className="text-[#06b6d4]">*</span>
              </label>
              <select
                name="tipo_documento"
                value={formData.tipo_documento}
                onChange={handleChange}
                className="bg-[#0b1120] border border-[#1e293b] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all"
              >
                <option value="CC">Cédula de Ciudadanía (CC)</option>
                <option value="CE">Cédula de Extranjería (CE)</option>
                <option value="NIT">NIT</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>

            {/* NUMERO DE DOCUMENTO */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Número de Documento <span className="text-[#06b6d4]">*</span>
              </label>
              <input
                type="text"
                name="numero_documento"
                required
                value={formData.numero_documento}
                onChange={handleChange}
                className="bg-[#0b1120] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all"
              />
            </div>

            {/* TELEFONO */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Teléfono / Celular <span className="text-[#06b6d4]">*</span>
              </label>
              <input
                type="text"
                name="telefono"
                required
                value={formData.telefono}
                onChange={handleChange}
                className="bg-[#0b1120] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all"
              />
            </div>

            {/* CORREO */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Correo Electrónico <span className="text-[#06b6d4]">*</span>
              </label>
              <input
                type="email"
                name="correo"
                required
                value={formData.correo}
                onChange={handleChange}
                className="bg-[#0b1120] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all"
              />
            </div>

            {/* DIRECCION */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Dirección de Residencia <span className="text-[#06b6d4]">*</span>
              </label>
              <input
                type="text"
                name="direccion"
                required
                value={formData.direccion}
                onChange={handleChange}
                className="bg-[#0b1120] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all"
              />
            </div>
          </div>

          {/* CAMBIO DE CONTRASEÑA OPCIONAL */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              🔒 Cambiar Contraseña (Opcional)
            </h3>
            <p className="text-xs text-slate-400">
              Deja estos campos en blanco si no deseas cambiar tu contraseña actual. Si la cambias, debe tener mínimo 9 caracteres.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="contrasena"
                    placeholder="Mínimo 9 caracteres"
                    value={formData.contrasena}
                    onChange={handleChange}
                    className="w-full bg-[#0b1120] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs bg-transparent border-none cursor-pointer"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmarContrasena"
                  placeholder="Repite la nueva contraseña"
                  value={formData.confirmarContrasena}
                  onChange={handleChange}
                  className="bg-[#0b1120] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all"
                />
              </div>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                setModoEdicion(false);
                setError("");
              }}
              className="px-5 py-3 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#06b6d4] to-[#0284c7] hover:from-[#22d3ee] hover:to-[#0369a1] text-slate-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? "Guardando Cambios..." : "💾 Guardar Cambios"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ClientPanel;

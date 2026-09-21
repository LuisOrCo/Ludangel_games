import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FormModal from "../components/FormModal";
import { API_URL } from "../config/api";

const formularioInicial = {
  nombre: "",
  apellido: "",
  tipo_documento: "CC",
  numero_documento: "",
  direccion: "",
  telefono: "",
  correo: "",
  contrasena: "",
  id_rol: "3",
};

const obtenerToken = () =>
  localStorage.getItem("authToken") ?? sessionStorage.getItem("authToken");

function AdminUsers() {
  const [usuarios, setUsuarios] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const solicitar = useCallback(async (ruta, opciones = {}) => {
    const respuesta = await fetch(`${API_URL}/api/v1/usuarios${ruta}`, {
      ...opciones,
      headers: {
        Authorization: `Bearer ${obtenerToken()}`,
        "Content-Type": "application/json",
        ...opciones.headers,
      },
    });
    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.message ?? "No fue posible completar la operación.");
    }

    return datos;
  }, []);

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await solicitar("/");
      setUsuarios(datos.usuarios);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [solicitar]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const abrirCrear = () => {
    setFormulario(formularioInicial);
    setUsuarioEditando(null);
    setMensaje("");
    setError("");
    setMostrarFormulario(true);
  };

  const abrirEditar = (usuario) => {
    setFormulario({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      tipo_documento: usuario.tipo_documento,
      numero_documento: usuario.numero_documento,
      direccion: usuario.direccion,
      telefono: usuario.telefono,
      correo: usuario.correo,
      contrasena: "",
      id_rol: String(usuario.id_rol),
    });
    setUsuarioEditando(usuario);
    setMensaje("");
    setError("");
    setMostrarFormulario(true);
  };

  const guardarUsuario = async (event) => {
    event.preventDefault();
    setGuardando(true);
    setError("");

    const datos = { ...formulario, id_rol: Number(formulario.id_rol) };
    if (usuarioEditando && !datos.contrasena) delete datos.contrasena;

    try {
      const ruta = usuarioEditando ? `/${usuarioEditando.id_usuario}` : "/";
      const metodo = usuarioEditando ? "PUT" : "POST";
      const respuesta = await solicitar(ruta, {
        method: metodo,
        body: JSON.stringify(datos),
      });
      setMensaje(respuesta.message);
      setMostrarFormulario(false);
      await cargarUsuarios();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (usuario) => {
    setError("");
    try {
      const respuesta = await solicitar(`/${usuario.id_usuario}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ estado: !Boolean(usuario.estado) }),
      });
      setMensaje(respuesta.message);
      await cargarUsuarios();
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminar = async (usuario) => {
    if (!window.confirm(`¿Eliminar definitivamente a ${usuario.nombre} ${usuario.apellido}?`)) return;

    setError("");
    try {
      const respuesta = await solicitar(`/${usuario.id_usuario}`, { method: "DELETE" });
      setMensaje(respuesta.message);
      await cargarUsuarios();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-7 px-6 py-12 sm:px-8 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to="/admin" className="text-sm font-semibold text-[#06b6d4] no-underline hover:underline">
            ← Volver al panel
          </Link>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">Gestión de usuarios</h1>
          <p className="mt-2 text-sm text-slate-400">Administra las cuentas y permisos del sistema.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre, correo, doc..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full sm:w-64 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={abrirCrear}
            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0284c7] px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-transform hover:-translate-y-0.5 shrink-0"
          >
            + Crear usuario
          </button>
        </div>
      </div>

      {mensaje && <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{mensaje}</p>}
      {error && <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      {mostrarFormulario && (
        <FormModal
          title={usuarioEditando ? "Editar usuario" : "Crear usuario"}
          onClose={() => setMostrarFormulario(false)}
        >
          <form onSubmit={guardarUsuario} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {error && <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300 md:col-span-2">{error}</p>}
            {[
              ["nombre", "Nombre", "text"],
              ["apellido", "Apellido", "text"],
              ["numero_documento", "Número de documento", "text"],
              ["direccion", "Dirección", "text"],
              ["telefono", "Teléfono", "tel"],
              ["correo", "Correo electrónico", "email"],
            ].map(([campo, etiqueta, tipo]) => (
              <label key={campo} className="flex flex-col gap-1.5 text-sm font-medium text-slate-300">
                {etiqueta}
                <input
                  type={tipo}
                  required
                  value={formulario[campo]}
                  onChange={(event) => setFormulario({ ...formulario, [campo]: event.target.value })}
                  className="rounded-xl border border-slate-700 bg-[#0b1120] px-3.5 py-3 text-white outline-none focus:border-[#06b6d4]"
                />
              </label>
            ))}
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-300">
              Tipo de documento
              <select
                value={formulario.tipo_documento}
                onChange={(event) => setFormulario({ ...formulario, tipo_documento: event.target.value })}
                className="rounded-xl border border-slate-700 bg-[#0b1120] px-3.5 py-3 text-white outline-none focus:border-[#06b6d4]"
              >
                <option value="CC">CC</option><option value="CE">CE</option><option value="TI">TI</option><option value="PASAPORTE">Pasaporte</option><option value="NIT">NIT</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-300">
              Rol
              <select
                value={formulario.id_rol}
                onChange={(event) => setFormulario({ ...formulario, id_rol: event.target.value })}
                className="rounded-xl border border-slate-700 bg-[#0b1120] px-3.5 py-3 text-white outline-none focus:border-[#06b6d4]"
              >
                <option value="1">Administrador</option><option value="2">Empleado</option><option value="3">Cliente</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-300 md:col-span-2">
              Contraseña {usuarioEditando && <span className="text-xs font-normal text-slate-500">(déjala vacía para conservarla)</span>}
              <input
                type="password"
                required={!usuarioEditando}
                minLength={9}
                value={formulario.contrasena}
                onChange={(event) => setFormulario({ ...formulario, contrasena: event.target.value })}
                className="rounded-xl border border-slate-700 bg-[#0b1120] px-3.5 py-3 text-white outline-none focus:border-[#06b6d4]"
              />
            </label>
            <div className="flex justify-end gap-3 pt-2 md:col-span-2">
              <button type="button" onClick={() => setMostrarFormulario(false)} className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300">Cancelar</button>
              <button disabled={guardando} className="rounded-xl bg-[#06b6d4] px-5 py-3 text-sm font-bold text-slate-950">
                {guardando ? "Guardando..." : "Guardar usuario"}
              </button>
            </div>
          </form>
        </FormModal>
      )}

      <section className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0f172a] shadow-xl">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400">
            <tr><th className="px-5 py-4">Usuario</th><th className="px-5 py-4">Contacto</th><th className="px-5 py-4">Rol</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4">Acciones</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {cargando ? (
              <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-400">Cargando usuarios...</td></tr>
            ) : (usuarios || []).filter(u => `${u?.nombre ?? ''} ${u?.apellido ?? ''} ${u?.correo ?? ''} ${u?.numero_documento ?? ''} ${u?.rol ?? ''}`.toLowerCase().includes((busqueda || '').toLowerCase())).length === 0 ? (
              <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-400">No hay usuarios que coincidan con la búsqueda.</td></tr>
            ) : (usuarios || []).filter(u => `${u?.nombre ?? ''} ${u?.apellido ?? ''} ${u?.correo ?? ''} ${u?.numero_documento ?? ''} ${u?.rol ?? ''}`.toLowerCase().includes((busqueda || '').toLowerCase())).map((usuario) => (
              <tr key={usuario.id_usuario} className="text-slate-300">
                <td className="px-5 py-4"><p className="font-bold text-white">{usuario.nombre} {usuario.apellido}</p><p className="mt-1 text-xs text-slate-500">#{usuario.id_usuario} · {usuario.numero_documento}</p></td>
                <td className="px-5 py-4"><p>{usuario.correo}</p><p className="mt-1 text-xs text-slate-500">{usuario.telefono}</p></td>
                <td className="px-5 py-4"><span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-bold text-cyan-300">{usuario.rol}</span></td>
                <td className="px-5 py-4"><button onClick={() => cambiarEstado(usuario)} className={`rounded-full px-2.5 py-1 text-xs font-bold ${usuario.estado ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>{usuario.estado ? "Activo" : "Inactivo"}</button></td>
                <td className="px-5 py-4"><div className="flex gap-2"><button onClick={() => abrirEditar(usuario)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 hover:border-cyan-500">Editar</button><button onClick={() => eliminar(usuario)} className="rounded-lg border border-red-500/40 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/10">Eliminar</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default AdminUsers;

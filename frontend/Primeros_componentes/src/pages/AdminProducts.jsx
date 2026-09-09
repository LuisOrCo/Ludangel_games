import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const formularioInicial = { nombre: "", descripcion: "", precio: "", stock: "0", imagen: "" };
const obtenerToken = () => localStorage.getItem("authToken") ?? sessionStorage.getItem("authToken");

function AdminProducts({ panelPath = "/admin" }) {
  const [productos, setProductos] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [productoEditando, setProductoEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const solicitar = useCallback(async (ruta, opciones = {}) => {
    const respuesta = await fetch(`${API_URL}/api/v1/productos${ruta}`, {
      ...opciones,
      headers: { Authorization: `Bearer ${obtenerToken()}`, "Content-Type": "application/json", ...opciones.headers },
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.message ?? "No fue posible completar la operación.");
    return datos;
  }, []);

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    try { setProductos((await solicitar("/")).productos); }
    catch (err) { setError(err.message); }
    finally { setCargando(false); }
  }, [solicitar]);

  useEffect(() => { cargarProductos(); }, [cargarProductos]);

  const abrirCrear = () => {
    setFormulario(formularioInicial); setProductoEditando(null); setError(""); setMensaje(""); setMostrarFormulario(true);
  };

  const abrirEditar = (producto) => {
    setFormulario({ nombre: producto.nombre, descripcion: producto.descripcion ?? "", precio: producto.precio, stock: producto.stock, imagen: producto.imagen ?? "" });
    setProductoEditando(producto); setError(""); setMensaje(""); setMostrarFormulario(true);
  };

  const guardar = async (event) => {
    event.preventDefault(); setGuardando(true); setError("");
    try {
      const respuesta = await solicitar(productoEditando ? `/${productoEditando.id_producto}` : "/", {
        method: productoEditando ? "PUT" : "POST", body: JSON.stringify(formulario),
      });
      setMensaje(respuesta.message); setMostrarFormulario(false); await cargarProductos();
    } catch (err) { setError(err.message); }
    finally { setGuardando(false); }
  };

  const cambiarEstado = async (producto) => {
    try {
      const respuesta = await solicitar(`/${producto.id_producto}/estado`, { method: "PATCH", body: JSON.stringify({ estado: !Boolean(producto.estado) }) });
      setMensaje(respuesta.message); await cargarProductos();
    } catch (err) { setError(err.message); }
  };

  const eliminar = async (producto) => {
    if (!window.confirm(`¿Eliminar definitivamente el producto "${producto.nombre}"?`)) return;
    try {
      const respuesta = await solicitar(`/${producto.id_producto}`, { method: "DELETE" });
      setMensaje(respuesta.message); await cargarProductos();
    } catch (err) { setError(err.message); }
  };

  const actualizarCampo = (campo, valor) => setFormulario({ ...formulario, [campo]: valor });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-7 px-6 py-12 sm:px-8 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><Link to={panelPath} className="text-sm font-semibold text-[#06b6d4] no-underline hover:underline">← Volver al panel</Link><h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">Gestión de productos</h1><p className="mt-2 text-sm text-slate-400">Administra el catálogo de LUDANGEL Games.</p></div>
        <button type="button" onClick={abrirCrear} className="rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0284c7] px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20">+ Crear producto</button>
      </div>
      {mensaje && <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{mensaje}</p>}
      {error && <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      {mostrarFormulario && <section className="rounded-2xl border border-cyan-500/30 bg-[#0f172a] p-6 shadow-xl sm:p-8">
        <h2 className="text-xl font-bold text-white">{productoEditando ? "Editar producto" : "Crear producto"}</h2>
        <form onSubmit={guardar} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-300 md:col-span-2">Nombre<input required maxLength="100" value={formulario.nombre} onChange={(e) => actualizarCampo("nombre", e.target.value)} className="rounded-xl border border-slate-700 bg-[#0b1120] px-3.5 py-3 text-white outline-none focus:border-[#06b6d4]" /></label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-300">Precio (COP)<input required min="1" step="0.01" type="number" value={formulario.precio} onChange={(e) => actualizarCampo("precio", e.target.value)} className="rounded-xl border border-slate-700 bg-[#0b1120] px-3.5 py-3 text-white outline-none focus:border-[#06b6d4]" /></label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-300">Stock<input required min="0" step="1" type="number" value={formulario.stock} onChange={(e) => actualizarCampo("stock", e.target.value)} className="rounded-xl border border-slate-700 bg-[#0b1120] px-3.5 py-3 text-white outline-none focus:border-[#06b6d4]" /></label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-300 md:col-span-2">URL de imagen <span className="text-xs font-normal text-slate-500">(opcional)</span><input type="url" value={formulario.imagen} onChange={(e) => actualizarCampo("imagen", e.target.value)} placeholder="https://..." className="rounded-xl border border-slate-700 bg-[#0b1120] px-3.5 py-3 text-white outline-none focus:border-[#06b6d4]" /></label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-300 md:col-span-2">Descripción <textarea rows="4" value={formulario.descripcion} onChange={(e) => actualizarCampo("descripcion", e.target.value)} className="rounded-xl border border-slate-700 bg-[#0b1120] px-3.5 py-3 text-white outline-none focus:border-[#06b6d4]" /></label>
          <div className="flex justify-end gap-3 pt-2 md:col-span-2"><button type="button" onClick={() => setMostrarFormulario(false)} className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300">Cancelar</button><button disabled={guardando} className="rounded-xl bg-[#06b6d4] px-5 py-3 text-sm font-bold text-slate-950">{guardando ? "Guardando..." : "Guardar producto"}</button></div>
        </form>
      </section>}

      <section className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0f172a] shadow-xl"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b border-slate-800 bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-4">Producto</th><th className="px-5 py-4">Precio</th><th className="px-5 py-4">Stock</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4">Acciones</th></tr></thead><tbody className="divide-y divide-slate-800">
        {cargando ? <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-400">Cargando productos...</td></tr> : productos.length === 0 ? <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-400">No hay productos registrados.</td></tr> : productos.map((producto) => <tr key={producto.id_producto} className="text-slate-300"><td className="px-5 py-4"><div className="flex items-center gap-3">{producto.imagen ? <img src={producto.imagen} alt="" className="h-11 w-11 rounded-lg object-cover" /> : <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-800 text-xl">🎮</span>}<div><p className="font-bold text-white">{producto.nombre}</p><p className="mt-1 max-w-xs truncate text-xs text-slate-500">{producto.descripcion || "Sin descripción"}</p></div></div></td><td className="px-5 py-4 font-semibold text-white">${Number(producto.precio).toLocaleString("es-CO")}</td><td className="px-5 py-4">{producto.stock}</td><td className="px-5 py-4"><button onClick={() => cambiarEstado(producto)} className={`rounded-full px-2.5 py-1 text-xs font-bold ${producto.estado ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>{producto.estado ? "Activo" : "Inactivo"}</button></td><td className="px-5 py-4"><div className="flex gap-2"><button onClick={() => abrirEditar(producto)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 hover:border-cyan-500">Editar</button><button onClick={() => eliminar(producto)} className="rounded-lg border border-red-500/40 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/10">Eliminar</button></div></td></tr>) }
      </tbody></table></section>
    </div>
  );
}

export default AdminProducts;

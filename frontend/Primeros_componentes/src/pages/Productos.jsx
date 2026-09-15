import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const respuesta = await fetch(`${API_URL}/api/v1/productos`);
        const datos = await respuesta.json();
        if (!respuesta.ok) throw new Error(datos.message ?? "No fue posible cargar los productos.");
        setProductos(datos.productos.filter((producto) => Boolean(producto.estado)));
      } catch (err) {
        setError(err.message ?? "No se pudo conectar con el servidor.");
      } finally {
        setCargando(false);
      }
    };
    cargarProductos();
  }, []);

  const agregarAlCarrito = (nombre) => {
    setCartCount((cantidad) => cantidad + 1);
    setToastMessage(`¡${nombre} añadido al carrito!`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-12 sm:px-8 sm:py-16">
      {toastMessage && <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#06b6d4] px-6 py-3.5 font-bold text-slate-950 shadow-2xl">🛒 {toastMessage}</div>}
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#06b6d4]">🎮 Catálogo oficial</div>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">Nuestros <span className="bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] bg-clip-text text-transparent">Productos</span></h1>
        <p className="text-base leading-relaxed text-slate-400 sm:text-lg">Productos disponibles actualmente en LUDANGEL Games.</p>
      </section>
      <div className="flex justify-end rounded-2xl border border-[#1e293b] bg-[#0f172a] p-4 shadow-lg"><div className="flex items-center gap-2 rounded-xl border border-[#1e293b] bg-[#0b1120] px-4 py-2 text-sm font-semibold text-slate-300">🛒 Carrito:<span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#06b6d4] text-xs font-bold text-slate-950">{cartCount}</span></div></div>
      {cargando && <p className="py-12 text-center text-slate-400">Cargando productos...</p>}
      {error && <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">{error}</p>}
      {!cargando && !error && productos.length === 0 && <p className="rounded-2xl border border-slate-800 bg-[#0f172a] py-12 text-center text-slate-400">Aún no hay productos disponibles.</p>}
      <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {productos.map((producto) => <article key={producto.id_producto} className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0f172a] shadow-xl transition-all hover:border-[#06b6d4]/60">
          <div className="h-64 bg-[#0b1120]">{producto.imagen ? <img src={producto.imagen} alt={producto.nombre} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-6xl">🎮</div>}</div>
          <div className="flex flex-1 flex-col justify-between gap-5 p-6"><div><h2 className="text-xl font-bold text-white">{producto.nombre}</h2><p className="mt-3 text-sm leading-relaxed text-slate-400">{producto.descripcion || "Sin descripción disponible."}</p></div><div className="flex items-end justify-between gap-4 border-t border-[#1e293b] pt-4"><div><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Precio</span><p className="text-2xl font-black text-white">${Number(producto.precio).toLocaleString("es-CO")}</p><p className="mt-1 text-xs text-slate-500">Stock: {producto.stock}</p></div><button onClick={() => agregarAlCarrito(producto.nombre)} disabled={producto.stock < 1} className="rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0284c7] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">{producto.stock < 1 ? "Agotado" : "+ Carrito"}</button></div></div>
        </article>)}
      </section>
    </div>
  );
}

export default Productos;

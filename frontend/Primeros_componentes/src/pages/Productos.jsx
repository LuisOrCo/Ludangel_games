import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";

function Productos() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modalCarritoAbierto, setModalCarritoAbierto] = useState(false);
  const [metodoPago, setMetodoPago] = useState("Tarjeta");
  const [procesandoCompra, setProcesandoCompra] = useState(false);
  const [compraExitosa, setCompraExitosa] = useState(null); // guarda id_venta

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const respuesta = await fetch(`${API_URL}/api/v1/productos/`);
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

  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.producto.id_producto === producto.id_producto);
      if (existe) {
        if (existe.cantidad >= producto.stock) {
          alert(`Solo hay ${producto.stock} unidades disponibles en stock.`);
          return prev;
        }
        return prev.map((item) =>
          item.producto.id_producto === producto.id_producto
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });

    setToastMessage(`¡${producto.nombre} añadido al carrito!`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const modificarCantidad = (id_producto, cambio) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.producto.id_producto === id_producto) {
            const nuevaCant = item.cantidad + cambio;
            if (nuevaCant > item.producto.stock) {
              alert(`Máximo ${item.producto.stock} unidades disponibles.`);
              return item;
            }
            return { ...item, cantidad: nuevaCant };
          }
          return item;
        })
        .filter((item) => item.cantidad > 0)
    );
  };

  const totalCarrito = carrito.reduce(
    (acc, item) => acc + Number(item.producto.precio) * item.cantidad,
    0
  );
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  const procesarCheckout = async () => {
    const token = localStorage.getItem("authToken") ?? sessionStorage.getItem("authToken");
    if (!token) {
      alert("Debes iniciar sesión como cliente para completar la compra.");
      navigate("/iniciar-sesion");
      return;
    }

    if (carrito.length === 0) return;

    setProcesandoCompra(true);
    try {
      const payload = {
        metodo_pago: metodoPago,
        detalles: carrito.map((item) => ({
          id_producto: item.producto.id_producto,
          cantidad: item.cantidad,
        })),
      };

      const res = await fetch(`${API_URL}/api/v1/ventas/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "No se pudo registrar la compra.");

      setCompraExitosa(data.id_venta);
      setCarrito([]);
    } catch (err) {
      alert(err.message);
    } finally {
      setProcesandoCompra(false);
    }
  };

  const descargarFactura = async (idVenta) => {
    const token = localStorage.getItem("authToken") ?? sessionStorage.getItem("authToken");
    try {
      const res = await fetch(`${API_URL}/api/v1/ventas/${idVenta}/factura-pdf`, {
        headers: { Authorization: `Bearer ${token}` },
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

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-12 sm:px-8 sm:py-16 text-white">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#06b6d4] px-6 py-3.5 font-bold text-slate-950 shadow-2xl">
          🛒 {toastMessage}
        </div>
      )}

      {/* BANNER HERO */}
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#06b6d4]">
          🎮 Catálogo Oficial LudAngel Games
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
          Nuestros <span className="bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] bg-clip-text text-transparent">Productos</span>
        </h1>
        <p className="text-base leading-relaxed text-slate-400 sm:text-lg">
          Explora y compra videojuegos, consolas y accesorios con facturación oficial.
        </p>
      </section>

      {/* BOTÓN VER CARRITO */}
      <div className="flex justify-end rounded-2xl border border-[#1e293b] bg-[#0f172a] p-4 shadow-lg">
        <button
          onClick={() => setModalCarritoAbierto(true)}
          className="flex items-center gap-3 rounded-xl border border-[#06b6d4]/40 bg-[#0b1120] px-5 py-2.5 text-sm font-bold text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
        >
          <span>🛒 Ver Carrito</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#06b6d4] text-xs font-black text-slate-950">
            {totalItems}
          </span>
          <span className="text-emerald-400 font-extrabold ml-1">
            ${totalCarrito.toLocaleString()}
          </span>
        </button>
      </div>

      {cargando && <p className="py-12 text-center text-slate-400">Cargando catálogo de productos...</p>}
      {error && <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">{error}</p>}

      {!cargando && !error && productos.length === 0 && (
        <p className="rounded-2xl border border-slate-800 bg-[#0f172a] py-12 text-center text-slate-400">
          Aún no hay productos disponibles.
        </p>
      )}

      {/* GRID DE PRODUCTOS */}
      <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {productos.map((producto) => (
          <article
            key={producto.id_producto}
            className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0f172a] shadow-xl transition-all hover:border-[#06b6d4]/60"
          >
            <div className="h-64 bg-[#0b1120]">
              {producto.imagen ? (
                <img src={producto.imagen} alt={producto.nombre} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl">🎮</div>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between gap-5 p-6">
              <div>
                <h2 className="text-xl font-bold text-white">{producto.nombre}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{producto.descripcion || "Sin descripción disponible."}</p>
              </div>

              <div className="flex items-end justify-between gap-4 border-t border-[#1e293b] pt-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Precio</span>
                  <p className="text-2xl font-black text-white">${Number(producto.precio).toLocaleString("es-CO")}</p>
                  <p className="mt-1 text-xs text-slate-500">Stock: {producto.stock} uds.</p>
                </div>

                <button
                  onClick={() => agregarAlCarrito(producto)}
                  disabled={producto.stock < 1}
                  className="rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0284c7] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 hover:from-cyan-400 hover:to-sky-400 transition-all cursor-pointer"
                >
                  {producto.stock < 1 ? "Agotado" : "+ Agregar"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* MODAL CHECKOUT CARRITO */}
      {modalCarritoAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-cyan-400">🛒 Tu Carrito de Compras</h3>
              <button
                onClick={() => {
                  setModalCarritoAbierto(false);
                  setCompraExitosa(null);
                }}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {compraExitosa ? (
              <div className="py-8 text-center space-y-4">
                <span className="text-5xl">🎉</span>
                <h4 className="text-xl font-bold text-emerald-400">¡Compra realizada con éxito!</h4>
                <p className="text-xs text-slate-300">
                  Tu pedido <strong>#{compraExitosa}</strong> se ha registrado en el sistema. Puedes descargar tu factura oficial a continuación:
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => descargarFactura(compraExitosa)}
                    className="rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-5 py-2.5 text-xs font-black shadow-lg"
                  >
                    📄 Descargar Factura PDF
                  </button>
                  <button
                    onClick={() => {
                      setModalCarritoAbierto(false);
                      setCompraExitosa(null);
                    }}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300"
                  >
                    Seguir Comprando
                  </button>
                </div>
              </div>
            ) : carrito.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                Tu carrito está vacío. ¡Agrega productos desde el catálogo!
              </div>
            ) : (
              <div className="my-4 space-y-4">
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {carrito.map((item) => (
                    <div
                      key={item.producto.id_producto}
                      className="flex items-center justify-between bg-slate-800/80 p-3 rounded-xl text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{item.producto.nombre}</p>
                        <p className="text-slate-400">${Number(item.producto.precio).toLocaleString()} c/u</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 border border-slate-700 rounded-lg p-1 bg-slate-900">
                          <button
                            onClick={() => modificarCantidad(item.producto.id_producto, -1)}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-bold"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-bold">{item.cantidad}</span>
                          <button
                            onClick={() => modificarCantidad(item.producto.id_producto, 1)}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-bold"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-bold text-emerald-400 min-w-[70px] text-right">
                          ${(Number(item.producto.precio) * item.cantidad).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-800 pt-3 space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Método de Pago:</label>
                    <select
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    >
                      <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                      <option value="Nequi">Nequi / Daviplata</option>
                      <option value="Transferencia">Transferencia Bancaria (PSE)</option>
                      <option value="Efectivo">Pago Contra Entrega (Efectivo)</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center text-sm font-black text-white pt-2 border-t border-slate-800">
                    <span>Total a Pagar:</span>
                    <span className="text-emerald-400 text-xl">${totalCarrito.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setModalCarritoAbierto(false)}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={procesarCheckout}
                    disabled={procesandoCompra}
                    className="rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0284c7] hover:from-cyan-400 hover:to-sky-400 text-slate-950 px-5 py-2.5 text-xs font-black shadow-lg"
                  >
                    {procesandoCompra ? "Procesando..." : "💳 Confirmar Compra"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Productos;

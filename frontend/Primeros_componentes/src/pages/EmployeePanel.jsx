import { useMemo } from "react";
import { Link } from "react-router-dom";

function EmployeePanel() {
  const usuario = useMemo(() => {
    const guardado = localStorage.getItem("authUser") ?? sessionStorage.getItem("authUser");
    return guardado ? JSON.parse(guardado) : null;
  }, []);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-12 sm:px-8 sm:py-16">
      <section className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-[#0f172a] to-[#0f172a] p-8 shadow-xl shadow-emerald-500/5 sm:p-10">
        <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">Panel de empleado</span>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">Hola, <span className="text-emerald-300">{usuario?.nombre}</span></h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">Desde este panel puedes consultar y gestionar el catálogo de productos.</p>
      </section>
      <section className="max-w-xl rounded-2xl border border-slate-800 bg-[#0f172a] p-7 shadow-lg">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-3xl">🎮</div>
        <h2 className="mt-5 text-xl font-bold text-white">Gestión de productos</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">Consulta, crea, edita, cambia el estado y elimina productos del catálogo.</p>
        <Link to="/empleado/productos" className="mt-6 inline-flex rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 no-underline hover:bg-emerald-300">Gestionar productos →</Link>
      </section>
    </div>
  );
}

export default EmployeePanel;

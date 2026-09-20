import { Link } from "react-router-dom";
import Carrusel from "./Carrusel";

function Inicio() {
  return (
    <div className="w-full text-white bg-[#0b1120] space-y-16 pb-16">
      {/* ── HERO SECTION (2 COLUMNAS: TEXTO IZQUIERDA + CARRUSEL DERECHA) ── */}
      <section className="mx-auto max-w-7xl px-6 pt-10 sm:px-8 sm:pt-14">
        <div className="grid grid-cols-1 gap-12 items-center lg:grid-cols-12">
          {/* COLUMNA IZQUIERDA: PRESENTACIÓN Y BIENVENIDA */}
          <div className="flex flex-col gap-6 lg:col-span-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#06b6d4]">
                🎮 SOBRE NOSOTROS
              </span>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
                Bienvenido a <br />
                <span className="bg-gradient-to-r from-[#06b6d4] via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                  LudAngel Games
                </span>
              </h1>
            </div>

            <p className="text-base text-slate-300 sm:text-lg leading-relaxed">
              Somos una tienda especializada en <strong>videojuegos, consolas y accesorios gaming</strong>. Nuestro objetivo es ofrecerte todo lo necesario para llevar tu experiencia de juego al siguiente nivel.
            </p>

            <p className="text-sm text-slate-400 leading-relaxed">
              Encuentra los últimos lanzamientos, accesorios para tu setup y productos 100% originales para todo tipo de jugador con garantía directa y facturación oficial.
            </p>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/productos"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0284c7] px-6 py-3.5 text-sm font-black uppercase tracking-wider text-slate-950 shadow-xl shadow-cyan-500/20 transition-all hover:from-cyan-300 hover:to-sky-400 hover:-translate-y-0.5 no-underline"
              >
                VER PRODUCTOS →
              </Link>
              <Link
                to="/contacto"
                className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-bold text-slate-200 transition-all hover:border-cyan-500/60 hover:text-white no-underline"
              >
                💬 Contáctanos
              </Link>
            </div>

            {/* MÉTODOS DE CONFIANZA */}
            <div className="grid grid-cols-3 gap-4 border-t border-slate-800/80 pt-6 mt-2">
              <div>
                <p className="text-xl font-black text-cyan-400">100%</p>
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Originales</p>
              </div>
              <div>
                <p className="text-xl font-black text-emerald-400">Garantía</p>
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Oficial</p>
              </div>
              <div>
                <p className="text-xl font-black text-indigo-400">Envíos</p>
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Nacionales</p>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: CARRUSEL INTERACTIVO EMBEBIDO */}
          <div className="lg:col-span-6 w-full">
            <Carrusel />
          </div>
        </div>
      </section>

      {/* ── SECCIÓN DE CATEGORÍAS Y SERVICIOS GAMING (4 CARDS) ── */}
      <section className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="border-t border-slate-800/80 pt-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Especialidades</span>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Todo para tu mundo Gaming</h2>
            <p className="mt-1 text-xs text-slate-400">Encuentra los mejores productos seleccionados especialmente para ti.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group rounded-2xl border border-slate-800 bg-[#0f172a] p-6 transition-all duration-300 hover:border-cyan-500/60 hover:-translate-y-1 shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-3xl">
                🎮
              </div>
              <h3 className="mt-4 text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">Videojuegos</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Los mejores títulos y lanzamientos para PlayStation, Xbox, Nintendo y PC.
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-800 bg-[#0f172a] p-6 transition-all duration-300 hover:border-cyan-500/60 hover:-translate-y-1 shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-3xl">
                🕹️
              </div>
              <h3 className="mt-4 text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">Consolas</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Consolas de última generación y modelos portátiles con soporte oficial.
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-800 bg-[#0f172a] p-6 transition-all duration-300 hover:border-cyan-500/60 hover:-translate-y-1 shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-3xl">
                ⌨️
              </div>
              <h3 className="mt-4 text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">Accesorios</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Mandos, audífonos pro, teclados mecánicos y componentes para tu setup.
              </p>
            </div>

            <div className="group rounded-2xl border border-slate-800 bg-[#0f172a] p-6 transition-all duration-300 hover:border-cyan-500/60 hover:-translate-y-1 shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-3xl">
                ⚡
              </div>
              <h3 className="mt-4 text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">Calidad Garantizada</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Garantía oficial y facturación en PDF expedida en cada una de tus compras.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BANNER CTA FINAL ── */}
      <section className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 p-8 sm:p-12 text-center shadow-2xl">
          <h2 className="text-2xl font-black text-white sm:text-4xl">
            ¿Listo para llevar tu experiencia al siguiente nivel?
          </h2>
          <p className="mt-3 text-sm text-slate-300 max-w-xl mx-auto">
            Explora nuestro catálogo completo de productos gaming con entrega rápida e información detallada.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-300 hover:-translate-y-0.5 no-underline"
            >
              🚀 EXPLORAR CATÁLOGO AHORA
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Inicio;
import { Link } from "react-router-dom";

function QuienesSomos() {
  return (
    <div className="py-12 sm:py-16 px-6 sm:px-8 max-w-7xl mx-auto flex flex-col gap-16">
      
      {/* HEADER SECTION */}
      <section className="text-center max-w-3xl mx-auto flex flex-col items-center gap-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/30 text-[#06b6d4] text-xs font-bold tracking-wider uppercase">
          <span>🎮</span> Sobre Nosotros
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Pasión por los <span className="bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] bg-clip-text text-transparent">Videojuegos</span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          Conoce un poco más sobre LUDANGEL Games, nuestra historia y la dedicación con la que trabajamos día a día para la comunidad gamer.
        </p>

        <div className="w-20 h-1 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] rounded-full mt-2 opacity-80"></div>
      </section>

      {/* HISTORIA Y MISIÓN GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
        
        {/* QUIÉNES SOMOS / HISTORIA */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-8 sm:p-10 flex flex-col justify-between shadow-xl">
          <div className="flex flex-col gap-5">
            <div className="inline-block w-fit px-3 py-1 rounded-md bg-slate-800 text-[#06b6d4] text-xs font-semibold">
              Nuestra Historia
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
              Una tienda creada por gamers para gamers
            </h2>

            <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
              LUDANGEL Games es un proyecto nacido de la pasión absoluta por los videojuegos, las consolas y el hardware gaming. Fundada con la visión de ser el punto de encuentro ideal, permitimos que cualquier jugador encuentre productos de la más alta calidad con atención personalizada.
            </p>

            <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
              Nos esforzamos por mantenernos siempre a la vanguardia ofreciendo los lanzamientos más esperados, asesoría técnica experta y precios competitivos.
            </p>
          </div>

          {/* VENTAJAS / PILARES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-[#1e293b]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/10 text-[#06b6d4] flex items-center justify-center font-bold text-sm shrink-0">✓</div>
              <span className="text-sm font-medium text-slate-200">Garantía Oficial</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/10 text-[#06b6d4] flex items-center justify-center font-bold text-sm shrink-0">✓</div>
              <span className="text-sm font-medium text-slate-200">Envíos Nacionales</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/10 text-[#06b6d4] flex items-center justify-center font-bold text-sm shrink-0">✓</div>
              <span className="text-sm font-medium text-slate-200">Soporte 24/7</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/10 text-[#06b6d4] flex items-center justify-center font-bold text-sm shrink-0">✓</div>
              <span className="text-sm font-medium text-slate-200">Productos Originales</span>
            </div>
          </div>
        </div>

        {/* MISIÓN & VISIÓN TARJETAS */}
        <div className="flex flex-col gap-6">
          
          {/* TARJETA MISIÓN */}
          <div className="bg-[#0f172a] border border-[#1e293b] hover:border-[#06b6d4]/50 rounded-2xl p-8 shadow-xl transition-all duration-300 group">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#06b6d4]/20 to-[#3b82f6]/20 border border-[#06b6d4]/30 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                🎮
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-white group-hover:text-[#06b6d4] transition-colors">
                  Nuestra Misión
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Ofrecer productos y experiencias de máxima calidad que permitan a nuestros clientes disfrutar al límite su pasión por los videojuegos, garantizando un servicio confiable y transparente.
                </p>
              </div>
            </div>
          </div>

          {/* TARJETA VISIÓN */}
          <div className="bg-[#0f172a] border border-[#1e293b] hover:border-[#3b82f6]/50 rounded-2xl p-8 shadow-xl transition-all duration-300 group">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                🚀
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                  Nuestra Visión
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Consolidarnos como la tienda de videojuegos y tecnología gaming preferida en la región, reconocida por nuestro catálogo diverso, comunidad activa e innovación constante.
                </p>
              </div>
            </div>
          </div>

          {/* TARJETA VALORES */}
          <div className="bg-[#0f172a] border border-[#1e293b] hover:border-amber-500/50 rounded-2xl p-8 shadow-xl transition-all duration-300 group">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                  Nuestros Valores
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Compromiso con la excelencia, honestidad en cada venta, agilidad en el servicio y amor por la cultura del entretenimiento digital.
                </p>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* ESTADÍSTICAS / METRICS SECTION */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 text-center shadow-lg">
          <span className="text-3xl sm:text-4xl font-extrabold text-[#06b6d4] block mb-1">+10K</span>
          <span className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">Clientes Felices</span>
        </div>
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 text-center shadow-lg">
          <span className="text-3xl sm:text-4xl font-extrabold text-[#06b6d4] block mb-1">+500</span>
          <span className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">Productos Gaming</span>
        </div>
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 text-center shadow-lg">
          <span className="text-3xl sm:text-4xl font-extrabold text-[#06b6d4] block mb-1">99.8%</span>
          <span className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">Entregas a Tiempo</span>
        </div>
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 text-center shadow-lg">
          <span className="text-3xl sm:text-4xl font-extrabold text-[#06b6d4] block mb-1">24/7</span>
          <span className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">Soporte Técnico</span>
        </div>
      </section>

      {/* BANNER CTA */}
      <section className="bg-gradient-to-r from-[#06b6d4]/20 via-slate-900 to-[#3b82f6]/20 border border-[#06b6d4]/30 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-2xl">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
          ¿Listo para equipar tu setup?
        </h2>
        <p className="text-slate-300 text-base max-w-xl">
          Explora nuestros productos más destacados o ponte en contacto con nuestro equipo para recibir asesoría personalizada.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/contacto"
            className="px-6 py-3.5 bg-gradient-to-r from-[#06b6d4] to-[#0284c7] hover:from-[#22d3ee] hover:to-[#0369a1] text-slate-950 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 no-underline"
          >
            Contactar Ahora →
          </Link>
          <Link
            to="/"
            className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all no-underline"
          >
            Ver Catálogo
          </Link>
        </div>
      </section>

    </div>
  );
}

export default QuienesSomos;
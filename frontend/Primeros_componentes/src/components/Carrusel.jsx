import { useState, useEffect } from "react";

import imagen1 from "../img/imagen1.jpg";
import imagen2 from "../img/imagen2.jpg";
import imagen3 from "../img/imagen3.jpg";
import imagen4 from "../img/imagen4.jpg";
import imagen5 from "../img/imagen5.jpg";
import imagen6 from "../img/imagen6.jpg";
import imagen7 from "../img/imagen7.jpg";
import imagen8 from "../img/imagen8.jpg";
import imagen9 from "../img/imagen9.jpg";
import imagen10 from "../img/imagen10.jpg";

function Carrusel() {
  const imagenes = [
    imagen1,
    imagen2,
    imagen3,
    imagen4,
    imagen5,
    imagen6,
    imagen7,
    imagen8,
    imagen9,
    imagen10,
  ];

  const [actual, setActual] = useState(0);

  const siguiente = () => {
    setActual((prev) => (prev + 1) % imagenes.length);
  };

  const anterior = () => {
    setActual((prev) => (prev - 1 + imagenes.length) % imagenes.length);
  };

  useEffect(() => {
    const intervalo = setInterval(() => {
      setActual((prev) => (prev + 1) % imagenes.length);
    }, 4500);

    return () => clearInterval(intervalo);
  }, [imagenes.length]);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#0f172a] shadow-2xl shadow-cyan-500/10 group">
      {/* IMAGEN DEL CARRUSEL */}
      <div className="relative h-80 sm:h-96 md:h-[420px] w-full overflow-hidden bg-slate-950">
        <img
          src={imagenes[actual]}
          alt={`Promoción ${actual + 1}`}
          className="h-full w-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
        />

        {/* OVERLAY DEGRADADO */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

        {/* INDICADOR EN LA IMAGEN */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <span className="rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-cyan-400 border border-cyan-500/30">
            Novedades {actual + 1} / {imagenes.length}
          </span>

          {/* PUNTOS INDICADORES */}
          <div className="flex gap-1.5">
            {imagenes.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActual(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  actual === idx ? "w-6 bg-cyan-400" : "w-2 bg-slate-600/70 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* BOTONES NAVEGACIÓN OVERLAY */}
        <button
          type="button"
          onClick={anterior}
          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/70 text-lg text-white backdrop-blur-md transition-all hover:bg-cyan-500 hover:text-slate-950 cursor-pointer shadow-lg"
          aria-label="Anterior"
        >
          ❮
        </button>

        <button
          type="button"
          onClick={siguiente}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/70 text-lg text-white backdrop-blur-md transition-all hover:bg-cyan-500 hover:text-slate-950 cursor-pointer shadow-lg"
          aria-label="Siguiente"
        >
          ❯
        </button>
      </div>
    </div>
  );
}

export default Carrusel;
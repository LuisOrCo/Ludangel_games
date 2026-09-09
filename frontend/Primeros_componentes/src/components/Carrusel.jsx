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
    setActual((actual + 1) % imagenes.length);
  };

  const anterior = () => {
    setActual((actual - 1 + imagenes.length) % imagenes.length);
  };

  useEffect(() => {
    const intervalo = setInterval(() => {
      setActual((actual) => (actual + 1) % imagenes.length);
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

return (
  <div className="w-full h-[450px] mx-auto mt-[20px] mb-[40px] flex items-center justify-center gap-[15px] px-4">
    <button
      onClick={anterior}
      className="bg-[#222] text-white border-none p-[15px] text-[20px] cursor-pointer rounded-[5px] hover:bg-[#444] shrink-0"
    >
      ❮
    </button>

    <img
      src={imagenes[actual]}
      alt={`Imagen ${actual + 1}`}
      className="flex-1 max-w-[750px] h-[400px] object-cover rounded-[10px]"
    />

    <button
      onClick={siguiente}
      className="bg-[#222] text-white border-none p-[15px] text-[20px] cursor-pointer rounded-[5px] hover:bg-[#444] shrink-0"
    >
      ❯
    </button>

  </div>
);
}

export default Carrusel;
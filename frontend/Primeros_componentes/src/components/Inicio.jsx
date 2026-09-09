import { Link } from "react-router-dom";

function Inicio() {
  return (
    <section className="w-full px-[8%] py-[80px] box-border border-b border-[#1e293b] max-[500px]:px-[5%] max-[500px]:py-[60px]">

      <div className="max-w-[1200px] mx-auto grid grid-cols-2 gap-[70px] items-center max-[800px]:grid-cols-1">

        {/* TEXTO */}
        <div>
          <span className="text-[#06b6d4] text-[13px] font-bold tracking-[2px] uppercase">
            SOBRE NOSOTROS
          </span>

          <h1 className="text-white text-[42px] mt-[15px] mb-[25px] font-extrabold max-[800px]:text-[34px]">
            Bienvenido a <span className="text-[#06b6d4]">LudAngel Games</span>
          </h1>

          <p className="text-slate-300 text-[16px] leading-[1.7] mb-[15px] max-w-[550px]">
            Somos una tienda especializada en videojuegos, consolas y
            accesorios gaming. Nuestro objetivo es ofrecerte todo lo necesario
            para llevar tu experiencia de juego al siguiente nivel.
          </p>

          <p className="text-slate-400 text-[16px] leading-[1.7] mb-[15px] max-w-[550px]">
            Encuentra los últimos lanzamientos, accesorios para tu setup y
            productos para todo tipo de jugador.
          </p>

          <Link
            to="/productos"
            className="inline-block mt-[15px] py-[13px] px-[24px] bg-[#06b6d4] text-slate-950 border-none rounded-xl font-bold cursor-pointer transition duration-300 hover:bg-[#22d3ee] hover:-translate-y-[2px] text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 no-underline"
          >
            VER PRODUCTOS →
          </Link>
        </div>

        {/* TARJETAS */}
        <div className="grid grid-cols-2 gap-[18px] max-[500px]:grid-cols-1">

          <div className="p-[25px] bg-[#0f172a] border border-[#1e293b] rounded-2xl transition duration-300 hover:border-[#06b6d4] hover:-translate-y-[5px] shadow-lg">
            <span className="text-[30px]">🎮</span>

            <h3 className="text-white mt-[15px] mb-[8px] font-bold">
              Videojuegos
            </h3>

            <p className="text-slate-400 leading-[1.5] text-[14px] m-0">
              Los mejores títulos para todas las plataformas.
            </p>
          </div>

          <div className="p-[25px] bg-[#0f172a] border border-[#1e293b] rounded-2xl transition duration-300 hover:border-[#06b6d4] hover:-translate-y-[5px] shadow-lg">
            <span className="text-[30px]">🕹️</span>

            <h3 className="text-white mt-[15px] mb-[8px] font-bold">
              Consolas
            </h3>

            <p className="text-slate-400 leading-[1.5] text-[14px] m-0">
              Consolas de última generación y clásicos.
            </p>
          </div>

          <div className="p-[25px] bg-[#0f172a] border border-[#1e293b] rounded-2xl transition duration-300 hover:border-[#06b6d4] hover:-translate-y-[5px] shadow-lg">
            <span className="text-[30px]">⌨️</span>

            <h3 className="text-white mt-[15px] mb-[8px] font-bold">
              Accesorios
            </h3>

            <p className="text-slate-400 leading-[1.5] text-[14px] m-0">
              Todo para construir tu setup gaming.
            </p>
          </div>

          <div className="p-[25px] bg-[#0f172a] border border-[#1e293b] rounded-2xl transition duration-300 hover:border-[#06b6d4] hover:-translate-y-[5px] shadow-lg">
            <span className="text-[30px]">⚡</span>

            <h3 className="text-white mt-[15px] mb-[8px] font-bold">
              Calidad
            </h3>

            <p className="text-slate-400 leading-[1.5] text-[14px] m-0">
              Productos seleccionados para gamers.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}

export default Inicio;
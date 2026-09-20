import { Link } from "react-router-dom";
import logo from "../assets/logo.jpg";

function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white border-t border-[#1e293b] mt-auto">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="LudAngel Games Logo Versión Blanca"
              className="h-12 w-auto object-contain opacity-95"
            />
            <h2 className="text-xl font-black text-white m-0 tracking-wide">LudAngel Games</h2>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed m-0">
            Tu tienda de confianza en videojuegos, consolas y accesorios gaming. Tu mundo gamer en un solo lugar.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-[#06b6d4] uppercase tracking-wider m-0">Navegación</h3>
          <ul className="flex flex-col gap-2 list-none p-0 m-0 text-sm">
            <li>
              <Link to="/" className="text-slate-400 hover:text-white no-underline transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/productos" className="text-slate-400 hover:text-white no-underline transition-colors">
                Productos
              </Link>
            </li>
            <li>
              <Link to="/quienes-somos" className="text-slate-400 hover:text-white no-underline transition-colors">
                ¿Quiénes somos?
              </Link>
            </li>
            <li>
              <Link to="/contacto" className="text-slate-400 hover:text-white no-underline transition-colors">
                Contacto
              </Link>
            </li>
            <li>
              <Link to="/iniciar-sesion" className="text-slate-400 hover:text-white no-underline transition-colors">
                Iniciar Sesión
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-[#06b6d4] uppercase tracking-wider m-0">Contacto</h3>
          <div className="flex flex-col gap-2.5 text-sm text-slate-400">
            <p className="m-0 flex items-center gap-2"><span>📍</span> Medellín, Colombia</p>
            <p className="m-0 flex items-center gap-2"><span>📧</span> contacto@ludangelgames.com</p>
            <p className="m-0 flex items-center gap-2"><span>📞</span> +57 300 123 4567</p>
          </div>
        </div>

      </div>

      <div className="border-t border-[#1e293b]/60 text-center py-6">
        <p className="m-0 text-slate-500 text-xs">
          © {new Date().getFullYear()} LUDANGEL Games. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
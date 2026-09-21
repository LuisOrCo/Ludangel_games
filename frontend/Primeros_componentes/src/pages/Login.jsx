import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RegisterModal from "../components/RegisterModal";
import PasswordRecoveryModal from "../components/PasswordRecoveryModal";
import logo from "../assets/logo.jpg";
import { API_URL } from "../config/api";

function Login() {
  const navigate = useNavigate();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [loginData, setLoginData] = useState({ correo: "", contrasena: "" });
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/api/v1/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginData),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "No fue posible iniciar sesión.");
      }

      const storage = rememberSession ? localStorage : sessionStorage;
      storage.setItem("authToken", data.token);
      storage.setItem("authUser", JSON.stringify(data.usuario));
      window.dispatchEvent(new Event("authChanged"));
      setLoginSuccess(true);

      setTimeout(() => {
        if (data.usuario?.id_rol === 1) {
          navigate("/admin");
        } else if (data.usuario?.id_rol === 2) {
          navigate("/empleado");
        } else if (data.usuario?.id_rol === 3) {
          navigate("/cliente");
        } else {
          navigate("/");
        }
      }, 1000);
    } catch (error) {
      setLoginError(error.message ?? "No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="py-12 sm:py-20 px-6 sm:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[75vh]">
      
      {/* HEADER SECTION */}
      <div className="text-center max-w-md mx-auto mb-8 flex flex-col items-center gap-3">
        <img
          src={logo}
          alt="LudAngel Games Logo"
          className="h-20 w-auto object-contain rounded-2xl shadow-xl shadow-cyan-500/20 mb-2 hover:scale-105 transition-transform"
        />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/30 text-[#06b6d4] text-xs font-bold tracking-wider uppercase">
          <span>🔐</span> Acceso a la Plataforma
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Iniciar <span className="bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] bg-clip-text text-transparent">Sesión</span>
        </h1>

        <p className="text-slate-400 text-sm">
          Ingresa tus datos para acceder a tu cuenta de LudAngel Games
        </p>
      </div>

      {/* LOGIN CARD */}
      <div className="w-full max-w-md bg-[#0f172a] border border-[#1e293b] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* LOGO DENTRO DE LA CARD EN LA PARTE DE ARRIBA */}
        <div className="flex justify-center mb-6 pb-4 border-b border-[#1e293b]">
          <img
            src={logo}
            alt="LudAngel Games Logo"
            className="h-14 w-auto object-contain rounded-xl"
          />
        </div>
        
        {loginSuccess ? (
          <div className="py-8 text-center flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#06b6d4]/20 border border-[#06b6d4] text-[#06b6d4] text-3xl flex items-center justify-center font-bold shadow-lg">
              ✓
            </div>
            <h3 className="text-xl font-bold text-white">¡Sesión Iniciada!</h3>
            <p className="text-slate-300 text-sm">
              Autenticado correctamente. Redirigiendo a tu panel personal...
            </p>
          </div>
        ) : (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
            
            {/* EMAIL */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Correo electrónico <span className="text-[#06b6d4]">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="ejemplo@correo.com"
                value={loginData.correo}
                onChange={(e) => setLoginData({ ...loginData, correo: e.target.value })}
                className="bg-[#0b1120] border border-[#1e293b] rounded-xl px-4 py-3.5 text-white placeholder-slate-500 text-sm outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all"
              />
            </div>

            {/* PASSWORD */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Contraseña <span className="text-[#06b6d4]">*</span>
                </label>
                <button type="button" onClick={() => setIsRecoveryOpen(true)} className="border-0 bg-transparent p-0 text-xs text-[#06b6d4] hover:underline cursor-pointer">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={loginData.contrasena}
                  onChange={(e) => setLoginData({ ...loginData, contrasena: e.target.value })}
                  className="w-full bg-[#0b1120] border border-[#1e293b] rounded-xl px-4 py-3.5 text-white placeholder-slate-500 text-sm outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs bg-transparent border-none cursor-pointer"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* REMEMBER ME */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="w-4 h-4 rounded border-[#1e293b] bg-[#0b1120] text-[#06b6d4] focus:ring-[#06b6d4] cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-slate-400 cursor-pointer select-none">
                Recordar mi sesión en este dispositivo
              </label>
            </div>

            {loginError && (
              <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {loginError}
              </p>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 py-3.5 px-6 bg-gradient-to-r from-[#06b6d4] to-[#0284c7] hover:from-[#22d3ee] hover:to-[#0369a1] text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all cursor-pointer text-center text-sm uppercase tracking-wider transform hover:-translate-y-0.5"
            >
              {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión →"}
            </button>

          </form>
        )}

        {/* REGISTRATION CTA IN CARD */}
        <div className="mt-8 pt-6 border-t border-[#1e293b] text-center flex flex-col items-center gap-3">
          <p className="text-slate-400 text-sm m-0">
            ¿No tienes una cuenta registrada?
          </p>
          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="w-full py-3 px-6 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700/80 transition-all cursor-pointer text-sm flex items-center justify-center gap-2 group"
          >
            <span>✨</span>
            <span>Crear Cuenta Nueva</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

      </div>

      {/* REGISTRATION MODAL COMPONENT */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
      <PasswordRecoveryModal
        isOpen={isRecoveryOpen}
        onClose={() => setIsRecoveryOpen(false)}
      />

    </div>
  );
}

export default Login;

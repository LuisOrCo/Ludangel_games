import { useState } from "react";
import logo from "../assets/logo.jpg";
import { API_URL } from "../config/api";

function PasswordRecoveryModal({ isOpen, onClose }) {
  const [step, setStep] = useState("email");
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setStep("email");
    setCorreo("");
    setCodigo("");
    setContrasena("");
    setConfirmacion("");
    setToken("");
    setMessage("");
    setError("");
  };

  const close = () => {
    resetState();
    onClose();
  };

  const requestCode = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/password-recovery/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "No fue posible enviar el código.");
      setMessage(data.message);
      setStep("code");
    } catch (requestError) {
      setError(requestError.message ?? "No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/password-recovery/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, codigo }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "El código no es válido.");
      setToken(data.token_recuperacion);
      setMessage("Código confirmado. Ahora crea tu nueva contraseña.");
      setStep("password");
    } catch (requestError) {
      setError(requestError.message ?? "No se pudo verificar el código.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setError("");
    if (contrasena.length < 9) {
      setError("La contraseña debe tener al menos 9 caracteres.");
      return;
    }
    if (contrasena !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/password-recovery/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token_recuperacion: token, contrasena }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "No fue posible actualizar la contraseña.");
      setMessage(data.message);
      setStep("success");
    } catch (requestError) {
      setError(requestError.message ?? "No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = step === "email" ? "Recuperar contraseña" : step === "code" ? "Verifica tu código" : step === "password" ? "Nueva contraseña" : "¡Contraseña actualizada!";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-[#1e293b] bg-[#0f172a] p-7 shadow-2xl">
        <button type="button" onClick={close} className="absolute right-4 top-3 border-0 bg-transparent text-2xl text-slate-400 hover:text-white" aria-label="Cerrar">×</button>
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logo} alt="LudAngel Games" className="mb-3 h-14 rounded-xl" />
          <h2 className="text-2xl font-black text-white">{title}</h2>
          <p className="mt-2 text-sm text-slate-400">
            {step === "email" && "Te enviaremos un código de seis dígitos a tu correo registrado."}
            {step === "code" && "Revisa tu bandeja de entrada e ingresa el código recibido."}
            {step === "password" && "Elige una contraseña de al menos 9 caracteres."}
            {step === "success" && "Ya puedes acceder con tu nueva contraseña."}
          </p>
        </div>

        {message && <p className="mb-4 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">{message}</p>}
        {error && <p className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

        {step === "email" && <form onSubmit={requestCode} className="flex flex-col gap-4">
          <input type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="Correo electrónico" className="rounded-xl border border-[#1e293b] bg-[#0b1120] px-4 py-3 text-white outline-none focus:border-cyan-400" />
          <button disabled={isSubmitting} className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 py-3 font-bold text-slate-950">{isSubmitting ? "Enviando..." : "Enviar código"}</button>
        </form>}

        {step === "code" && <form onSubmit={verifyCode} className="flex flex-col gap-4">
          <input type="text" required inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))} placeholder="Código de 6 dígitos" className="rounded-xl border border-[#1e293b] bg-[#0b1120] px-4 py-3 text-center text-lg tracking-[0.5em] text-white outline-none focus:border-cyan-400" />
          <button disabled={isSubmitting} className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 py-3 font-bold text-slate-950">{isSubmitting ? "Verificando..." : "Verificar código"}</button>
          <button type="button" onClick={() => { setError(""); setMessage(""); setStep("email"); }} className="border-0 bg-transparent text-sm text-cyan-400 hover:underline">Usar otro correo o reenviar código</button>
        </form>}

        {step === "password" && <form onSubmit={resetPassword} className="flex flex-col gap-4">
          <input type="password" required minLength="9" value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder="Nueva contraseña" className="rounded-xl border border-[#1e293b] bg-[#0b1120] px-4 py-3 text-white outline-none focus:border-cyan-400" />
          <input type="password" required minLength="9" value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} placeholder="Confirmar nueva contraseña" className="rounded-xl border border-[#1e293b] bg-[#0b1120] px-4 py-3 text-white outline-none focus:border-cyan-400" />
          <button disabled={isSubmitting} className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 py-3 font-bold text-slate-950">{isSubmitting ? "Actualizando..." : "Actualizar contraseña"}</button>
        </form>}

        {step === "success" && <button type="button" onClick={close} className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 py-3 font-bold text-slate-950">Volver a iniciar sesión</button>}
      </div>
    </div>
  );
}

export default PasswordRecoveryModal;

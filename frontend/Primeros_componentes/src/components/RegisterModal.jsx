import { useState } from "react";
import logo from "../assets/logo.jpg";

function RegisterModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    tipo_documento: "CC",
    numero_documento: "",
    direccion: "",
    telefono: "",
    correo: "",
    contrasena: "",
    confirmar_contrasena: "",
  });

  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validarNombre = (valor) => {
  if (!valor.trim()) {
    return "El nombre es obligatorio";
  }

  if (valor.length < 3) {
    return "El nombre debe tener mínimo 3 caracteres";
  }

  if (valor.length > 30) {
    return "El nombre no puede superar los 30 caracteres";
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) {
    return "El nombre solo puede contener letras";
  }

  return "";
};

const validarApellido = (valor) => {
  if (!valor.trim()) {
    return "El apellido es obligatorio";
  }

  if (valor.length < 3) {
    return "El apellido debe tener mínimo 3 caracteres";
  }

  if (valor.length > 30) {
    return "El apellido no puede superar los 30 caracteres";
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) {
    return "El apellido solo puede contener letras";
  }

  return "";
};

const validarDocumento = (valor) => {
  if (!valor.trim()) {
    return "El número de documento es obligatorio";
  }

  if (!/^\d+$/.test(valor)) {
    return "El documento solo puede contener números";
  }

  if (valor.length < 6) {
    return "El documento debe tener mínimo 6 números";
  }

  if (valor.length > 15) {
    return "El documento no puede superar los 15 números";
  }

  return "";
};

const validarDireccion = (valor) => {
  if (!valor.trim()) {
    return "La dirección es obligatoria";
  }

  if (valor.length < 5) {
    return "La dirección debe tener mínimo 5 caracteres";
  }

  if (valor.length > 100) {
    return "La dirección no puede superar los 100 caracteres";
  }

  return "";
};

const validarTelefono = (valor) => {
  if (!valor.trim()) {
    return "El teléfono es obligatorio";
  }

  if (!/^\d+$/.test(valor)) {
    return "El teléfono solo puede contener números";
  }

  if (valor.length !== 10) {
    return "El teléfono debe tener 10 números";
  }

  if (!/^3\d{9}$/.test(valor)) {
    return "Ingresa un número de celular colombiano válido";
  }

  return "";
};

const validarEmail = (valor) => {
  if (!valor.trim()) {
    return "El correo electrónico es obligatorio";
  }

  if (valor.length > 100) {
    return "El correo no puede superar los 100 caracteres";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
    return "Ingresa un correo electrónico válido";
  }

  return "";
};

const validarPassword = (valor) => {
  if (!valor) {
    return "La contraseña es obligatoria";
  }

  if (valor.length < 9) {
    return "La contraseña debe tener mínimo 9 caracteres";
  }

  if (valor.length > 30) {
    return "La contraseña no puede superar los 30 caracteres";
  }

  if (!/[A-Z]/.test(valor)) {
    return "Debe contener al menos una letra mayúscula";
  }

  if (!/[a-z]/.test(valor)) {
    return "Debe contener al menos una letra minúscula";
  }

  if (!/[0-9]/.test(valor)) {
    return "Debe contener al menos un número";
  }

  if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(valor)) {
    return "Debe contener al menos un carácter especial";
  }

  return "";
};

const validarConfirmPassword = (valor) => {
  if (!valor) {
    return "Debes confirmar la contraseña";
  }

  if (valor !== formData.contrasena) {
    return "Las contraseñas no coinciden";
  }

  return "";
};

  if (!isOpen) return null;

const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  let error = "";

  switch (name) {
    case "nombre":
      error = validarNombre(value);
      break;

    case "apellido":
      error = validarApellido(value);
      break;

    case "numero_documento":
      error = validarDocumento(value);
      break;

    case "direccion":
      error = validarDireccion(value);
      break;

    case "telefono":
      error = validarTelefono(value);
      break;

    case "correo":
      error = validarEmail(value);
      break;

    case "contrasena":
      error = validarPassword(value);
      break;

    case "confirmar_contrasena":
      error = validarConfirmPassword(value);
      break;

    default:
      break;
  }

  setErrors((prev) => ({
    ...prev,
    [name]: error,
  }));

  if (name === "contrasena" && formData.confirmar_contrasena) {
    setErrors((prev) => ({
      ...prev,
      contrasena: error,
      confirmar_contrasena:
        value === formData.confirmar_contrasena
          ? ""
          : "Las contraseñas no coinciden",
    }));
  }
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = {
      nombre: validarNombre(formData.nombre),
      apellido: validarApellido(formData.apellido),
      numero_documento: validarDocumento(formData.numero_documento),
      direccion: validarDireccion(formData.direccion),
      telefono: validarTelefono(formData.telefono),
      correo: validarEmail(formData.correo),
      contrasena: validarPassword(formData.contrasena),
      confirmar_contrasena: validarConfirmPassword(formData.confirmar_contrasena),
    };

    setErrors(validationErrors);
    if (Object.values(validationErrors).some(Boolean)) {
      setSubmitError("No se permiten campos vacíos ni datos inválidos. Por favor completa todos los campos requeridos.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/v1/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: formData.nombre,
            apellido: formData.apellido,
            tipo_documento: formData.tipo_documento,
            numero_documento: formData.numero_documento,
            direccion: formData.direccion,
            telefono: formData.telefono,
            correo: formData.correo,
            contrasena: formData.contrasena,
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "No fue posible completar el registro.");
      }

      setRegisteredSuccess(true);
    } catch (error) {
      setSubmitError(error.message ?? "No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* MODAL HEADER CON LOGO EN LA PARTE DE ARRIBA */}
        <div className="flex items-center justify-between p-6 border-b border-[#1e293b] bg-[#0b1120]/50">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="LudAngel Games Logo"
              className="h-11 w-auto object-contain rounded-xl shadow-md border border-[#1e293b]"
            />
            <div>
              <h2 className="text-xl font-bold text-white m-0">Crear una Cuenta</h2>
              <p className="text-slate-400 text-xs m-0">Diligencia el formulario para registrarte en LudAngel Games</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-lg transition-colors cursor-pointer border border-slate-700/50"
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 sm:p-8">
          {registeredSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[#06b6d4]/20 border border-[#06b6d4] text-[#06b6d4] text-3xl flex items-center justify-center font-bold shadow-lg">
                ✓
              </div>
              <h3 className="text-2xl font-bold text-white">¡Registro Exitoso!</h3>
              <p className="text-slate-300 text-sm max-w-md">
                Tu cuenta ha sido creada satisfactoriamente. Ahora puedes iniciar sesión con tus credenciales.
              </p>
            </div>
          ) : (
            <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              {/* FILA 1: NOMBRE Y APELLIDO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Nombre <span className="text-[#06b6d4]">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    maxLength={30}
                    placeholder="Ej. Juan"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={`bg-[#0b1120] border rounded-xl px-3.5 py-3 text-white placeholder-slate-500 text-sm outline-none transition-all ${
                      errors.nombre
                        ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-[#1e293b] focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]"
                    }`}
                  />
                  {errors.nombre && (
                    <span className="text-red-400 text-xs">
                      {errors.nombre}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Apellido <span className="text-[#06b6d4]">*</span>
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    maxLength={30}
                    placeholder="Ej. Pérez"
                    value={formData.apellido}
                    onChange={handleChange}
                    className={`bg-[#0b1120] border rounded-xl px-3.5 py-3 text-white placeholder-slate-500 text-sm outline-none transition-all ${
                      errors.apellido
                        ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-[#1e293b] focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]"
                    }`}
                  />
                  {errors.apellido && (
                    <span className="text-red-400 text-xs">
                      {errors.apellido}
                    </span>
                  )}
                </div>
              </div>

              {/* FILA 2: TIPO Y NÚMERO DE DOCUMENTO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Tipo de documento <span className="text-[#06b6d4]">*</span>
                  </label>
                  <select
                    name="tipo_documento"
                    value={formData.tipo_documento}
                    onChange={handleChange}
                    className="bg-[#0b1120] border border-[#1e293b] rounded-xl px-3.5 py-3 text-white text-sm outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all cursor-pointer"
                  >
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="TI">Tarjeta de Identidad (TI)</option>
                    <option value="NIT">Número de Identificación Tributaria (NIT)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Número de documento <span className="text-[#06b6d4]">*</span>
                  </label>
                  <input
                    type="text"
                    name="numero_documento"
                    maxLength={15}
                    placeholder="123456789"
                    value={formData.numero_documento}
                    onChange={handleChange}
                    className={`bg-[#0b1120] border rounded-xl px-3.5 py-3 text-white placeholder-slate-500 text-sm outline-none transition-all ${
                      errors.numero_documento
                        ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-[#1e293b] focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]"
                    }`}
                  />
                  {errors.numero_documento && (
                    <span className="text-red-400 text-xs">
                      {errors.numero_documento}
                    </span>
                  )}
                </div>
              </div>

              {/* FILA 3: DIRECCIÓN Y TELÉFONO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Dirección <span className="text-[#06b6d4]">*</span>
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    maxLength={100}
                    placeholder="Calle 123 # 45 - 67"
                    value={formData.direccion}
                    onChange={handleChange}
                    className={`bg-[#0b1120] border rounded-xl px-3.5 py-3 text-white placeholder-slate-500 text-sm outline-none transition-all ${
                      errors.direccion
                        ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-[#1e293b] focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]"
                    }`}
                  />
                  {errors.direccion && (
                    <span className="text-red-400 text-xs">
                      {errors.direccion}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Teléfono <span className="text-[#06b6d4]">*</span>
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    maxLength={10}
                    placeholder="300 000 0000"
                    value={formData.telefono}
                    onChange={handleChange}
                    className={`bg-[#0b1120] border rounded-xl px-3.5 py-3 text-white placeholder-slate-500 text-sm outline-none transition-all ${
                      errors.telefono
                        ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-[#1e293b] focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]"
                    }`}
                  />
                  {errors.telefono && (
                    <span className="text-red-400 text-xs">
                      {errors.telefono}
                    </span>
                  )}
                </div>
              </div>

              {/* FILA 4: CORREO ELECTRÓNICO */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Correo electrónico <span className="text-[#06b6d4]">*</span>
                </label>
                <input
                  type="text"
                  name="correo"
                  maxLength={100}
                  placeholder="usuario@ejemplo.com"
                  value={formData.correo}
                  onChange={handleChange}
                  className={`bg-[#0b1120] border rounded-xl px-3.5 py-3 text-white placeholder-slate-500 text-sm outline-none transition-all ${
                    errors.correo
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-[#1e293b] focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]"
                  }`}
                />
                {errors.correo && (
                  <span className="text-red-400 text-xs">
                    {errors.correo}
                  </span>
                )}
              </div>

              {/* FILA 5: CONTRASEÑA Y CONFIRMACIÓN DE CONTRASEÑA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Contraseña <span className="text-[#06b6d4]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="contrasena"
                      maxLength={30}
                      placeholder="••••••••"
                      value={formData.contrasena}
                      onChange={handleChange}
                      className={`w-full bg-[#0b1120] border rounded-xl px-3.5 py-3 text-white placeholder-slate-500 text-sm outline-none transition-all pr-10 ${
                        errors.contrasena
                          ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-[#1e293b] focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]"
                      }`}
                    />
                    {errors.contrasena && (
                      <span className="text-red-400 text-xs">
                        {errors.contrasena}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs bg-transparent border-none cursor-pointer"
                    >
                      {showPassword ? "🔓" : "🔒"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Confirmación de contraseña <span className="text-[#06b6d4]">*</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmar_contrasena"
                    maxLength={30}
                    placeholder="••••••••"
                    value={formData.confirmar_contrasena}
                    onChange={handleChange}
                    className={`bg-[#0b1120] border rounded-xl px-3.5 py-3 text-white placeholder-slate-500 text-sm outline-none transition-all ${
                      errors.confirmar_contrasena
                        ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-[#1e293b] focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]"
                    }`}
                  />
                  {errors.confirmar_contrasena && (
                    <span className="text-red-400 text-xs">
                      {errors.confirmar_contrasena}
                    </span>
                  )}
                </div>
              </div>

              {submitError && (
                <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {submitError}
                </p>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all cursor-pointer border border-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0284c7] hover:from-[#22d3ee] hover:to-[#0369a1] text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all cursor-pointer uppercase tracking-wider"
                >
                  {isSubmitting ? "Creando cuenta..." : "Crear Cuenta →"}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}

export default RegisterModal;

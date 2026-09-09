import { useState } from "react";

function Contacto() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    asunto: "",
    mensaje: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ nombre: "", email: "", asunto: "", mensaje: "" });
    }, 4000);
  };

  return (
    <div className="py-12 sm:py-16 px-6 sm:px-8 max-w-7xl mx-auto flex flex-col gap-16">
      
      {/* HEADER SECTION */}
      <section className="text-center max-w-3xl mx-auto flex flex-col items-center gap-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/30 text-[#06b6d4] text-xs font-bold tracking-wider uppercase">
          <span>💬</span> Estamos para ayudarte
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Ponte en <span className="bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] bg-clip-text text-transparent">Contacto</span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          ¿Tienes alguna duda sobre nuestros productos, envíos o necesitas asesoría personalizada? Escríbenos y con gusto te atenderemos.
        </p>

        <div className="w-20 h-1 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] rounded-full mt-2 opacity-80"></div>
      </section>

      {/* MAIN GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

        {/* LEFT COLUMN: INFORMACIÓN Y CANALES */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Hablemos
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Puedes comunicarte con nosotros a través de cualquiera de nuestros canales de atención directa. Respondemos a todas tus inquietudes a la brevedad.
            </p>
          </div>

          {/* LISTA DE CONTACTOS */}
          <div className="flex flex-col gap-5">
            
            <div className="bg-[#0f172a] border border-[#1e293b] hover:border-[#06b6d4]/40 rounded-xl p-5 flex items-center gap-5 transition-all shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/10 text-[#06b6d4] text-2xl flex items-center justify-center shrink-0 border border-[#06b6d4]/20">
                📍
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">Ubicación</h3>
                <p className="text-slate-400 text-sm mt-0.5">Medellín, Colombia</p>
                <span className="text-xs text-[#06b6d4] mt-1 block">Oficina Principal & Showroom</span>
              </div>
            </div>

            <div className="bg-[#0f172a] border border-[#1e293b] hover:border-[#06b6d4]/40 rounded-xl p-5 flex items-center gap-5 transition-all shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/10 text-[#06b6d4] text-2xl flex items-center justify-center shrink-0 border border-[#06b6d4]/20">
                📧
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">Correo Electrónico</h3>
                <p className="text-slate-400 text-sm mt-0.5">contacto@ludangelgames.com</p>
                <span className="text-xs text-slate-500 mt-1 block">Respuesta rápida en menos de 2h</span>
              </div>
            </div>

            <div className="bg-[#0f172a] border border-[#1e293b] hover:border-[#06b6d4]/40 rounded-xl p-5 flex items-center gap-5 transition-all shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/10 text-[#06b6d4] text-2xl flex items-center justify-center shrink-0 border border-[#06b6d4]/20">
                📞
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">Teléfono & WhatsApp</h3>
                <p className="text-slate-400 text-sm mt-0.5">+57 300 123 4567</p>
                <span className="text-xs text-slate-500 mt-1 block">Lunes a Sábado: 8:00 AM - 7:00 PM</span>
              </div>
            </div>

          </div>

          {/* HORARIOS CARD */}
          <div className="bg-gradient-to-br from-slate-900 to-[#0f172a] border border-[#1e293b] rounded-xl p-6 shadow-md">
            <h4 className="text-sm font-bold text-[#06b6d4] uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>🕒</span> Horario de Atención
            </h4>
            <ul className="text-xs text-slate-300 flex flex-col gap-2 p-0 m-0 list-none">
              <li className="flex justify-between py-1.5 border-b border-[#1e293b]">
                <span className="text-slate-400">Lunes - Viernes:</span>
                <span className="font-semibold">8:00 AM - 6:00 PM</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-[#1e293b]">
                <span className="text-slate-400">Sábados:</span>
                <span className="font-semibold">9:00 AM - 2:00 PM</span>
              </li>
              <li className="flex justify-between py-1.5">
                <span className="text-slate-400">Domingos y Festivos:</span>
                <span className="text-amber-400 font-semibold">Atención Web 24/7</span>
              </li>
            </ul>
          </div>

        </div>

        {/* RIGHT COLUMN: FORMULARIO */}
        <div className="lg:col-span-7">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            
            <div className="flex flex-col gap-2 mb-8">
              <h3 className="text-2xl font-bold text-white">Envíanos un mensaje</h3>
              <p className="text-slate-400 text-sm">
                Llena los siguientes campos y nos pondremos en contacto contigo lo antes posible.
              </p>
            </div>

            {submitted ? (
              <div className="bg-[#06b6d4]/10 border border-[#06b6d4]/40 rounded-xl p-8 text-center flex flex-col items-center gap-4 my-8 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-[#06b6d4] text-slate-950 text-3xl flex items-center justify-center font-bold shadow-lg">
                  ✓
                </div>
                <h4 className="text-xl font-bold text-white">¡Mensaje Enviado con Éxito!</h4>
                <p className="text-slate-300 text-sm max-w-md">
                  Gracias por escribirnos. Nuestro equipo revisará tu solicitud y se comunicará contigo al correo proporcionado en breve.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Nombre Completo <span className="text-[#06b6d4]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre completo"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="bg-[#0b1120] border border-[#1e293b] rounded-xl px-4 py-3.5 text-white placeholder-slate-500 text-sm outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Correo Electrónico <span className="text-[#06b6d4]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="ejemplo@correo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-[#0b1120] border border-[#1e293b] rounded-xl px-4 py-3.5 text-white placeholder-slate-500 text-sm outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Asunto
                  </label>
                  <input
                    type="text"
                    placeholder="¿En qué te podemos ayudar?"
                    value={formData.asunto}
                    onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                    className="bg-[#0b1120] border border-[#1e293b] rounded-xl px-4 py-3.5 text-white placeholder-slate-500 text-sm outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Mensaje <span className="text-[#06b6d4]">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Escribe aquí tu consulta o mensaje detallado..."
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    className="bg-[#0b1120] border border-[#1e293b] rounded-xl px-4 py-3.5 text-white placeholder-slate-500 text-sm outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="mt-2 py-4 px-8 bg-gradient-to-r from-[#06b6d4] to-[#0284c7] hover:from-[#22d3ee] hover:to-[#0369a1] text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all cursor-pointer text-center text-sm uppercase tracking-wider transform hover:-translate-y-0.5"
                >
                  Enviar Mensaje →
                </button>

              </form>
            )}

          </div>
        </div>

      </section>

    </div>
  );
}

export default Contacto;
import React, { useState, useRef, useEffect } from "react";

const API_BASE = "http://localhost:8000/api/v1";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "¡Hola! 👋 Soy **LudBot**, el asistente de IA de **LudAngel Games**. ¿En qué puedo ayudarte hoy?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const SUGGESTIONS = [
    "🎮 ¿Qué consolas y juegos tienen?",
    "🛒 ¿Cómo realizar una compra?",
    "📋 ¿Cómo radicar una PQRS?",
    "📍 Horarios y contacto",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chatbot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: query }),
      });

      if (!response.ok) {
        throw new Error("Error en el servidor de chatbot");
      }

      const data = await response.json();
      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: data.respuesta || "Lo siento, tuve un inconveniente al procesar tu solicitud.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isAi: data.origen === "ai",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "🎮 LudBot: En este momento el servicio no responde, pero puedes revisar nuestra tienda o escribirnos por WhatsApp.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (text) => {
    // Convierte negritas markdown **texto** y saltos de línea \n
    const parts = text.split(/(\*\*.*?\*\*|\n)/g);
    return parts.map((part, index) => {
      if (part === "\n") return <br key={index} />;
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-semibold text-cyan-300">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-24 z-50">
      {/* Botón flotante para abrir/cerrar */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-950/50 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-cyan-400/40 relative group"
          title="Asistente Virtual LudBot (IA)"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
          </span>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Ventana de Chatbot */}
      {isOpen && (
        <div className="flex flex-col w-[360px] sm:w-[400px] h-[520px] bg-[#0f172a] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header del Chat */}
          <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] p-4 border-b border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/30">
                  🤖
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0f172a] rounded-full"></span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  LudBot IA
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30 font-normal">
                    Asistente 24/7
                  </span>
                </h3>
                <p className="text-xs text-gray-400">LudAngel Games • En línea</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              title="Minimizar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b1120]/80">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-md shadow-cyan-900/30"
                      : "bg-[#1e293b] text-gray-200 border border-slate-700/60 rounded-tl-none shadow-md"
                  }`}
                >
                  {renderFormattedText(msg.text)}
                </div>
                <span className="text-[10px] text-gray-500 mt-1 px-1">
                  {msg.time}
                </span>
              </div>
            ))}

            {/* Indicador de carga */}
            {loading && (
              <div className="flex items-center space-x-2 bg-[#1e293b] text-cyan-400 px-4 py-2.5 rounded-2xl rounded-tl-none border border-slate-700/60 w-fit">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <span className="text-xs text-gray-400 ml-1">LudBot está pensando...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias Rápidas */}
          <div className="px-3 py-2 bg-[#0f172a] border-t border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
            {SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sug)}
                disabled={loading}
                className="whitespace-nowrap text-xs bg-slate-800/80 hover:bg-cyan-950 hover:text-cyan-300 text-gray-300 border border-slate-700/50 hover:border-cyan-500/50 px-2.5 py-1 rounded-full transition disabled:opacity-50 flex-shrink-0"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input de Mensaje */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#0f172a] border-t border-slate-800 flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta aquí..."
              disabled={loading}
              className="flex-1 bg-slate-900 text-white placeholder-gray-500 text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500 transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white p-2.5 rounded-xl transition shadow-md shadow-cyan-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              title="Enviar mensaje"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>

        </div>
      )}
    </div>
  );
}

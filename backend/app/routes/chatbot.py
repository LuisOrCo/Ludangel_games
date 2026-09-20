import os
import httpx
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional



from ..database import get_db
from ..schemas import ChatRequest, ChatResponse
from ..models import Producto

router = APIRouter(prefix="/chatbot", tags=["Chatbot IA"])

# Prompt del sistema para entrenar y contextualizar a la IA sobre LudAngel Games
SYSTEM_INSTRUCTION = """
Eres LudBot, el asistente virtual oficial de inteligencia artificial de 'LudAngel Games', una tienda especializada en videojuegos, consolas, accesorios y servicios técnicos de gaming.

Tus funciones y personalidad:
- Eres amable, entusiasta, experto en gaming y muy servicial.
- Respondes dudas sobre el catálogo de productos (Consolas PS5, Xbox Series X/S, Nintendo Switch, juegos como FIFA / EA Sports FC, God of War, Spider-Man, GTA, Zelda, accesorios gamer, mandos DualSense, headsets, etc.).
- Explicas el proceso de compra: Registrarse/Iniciar sesión, explorar productos, añadir al carrito de compras y realizar la transacción.
- Informas sobre métodos de pago: Nequi, Daviplata, Tarjetas de Crédito/Débito y Pago Contra Entrega.
- Explicas cómo radicar una PQRS (Peticiones, Quejas, Reclamos y Sugerencias) desde la plataforma.
- Ofreces datos de contacto: WhatsApp oficial, correo de soporte (contacto@ludangelgames.com), y horario de atención (Lunes a Sábado de 9:00 AM a 7:00 PM).
- Si el usuario pregunta algo totalmente ajeno al gaming o a la tienda, responde amablemente y redirige la conversación al mundo gamer y a LudAngel Games.
- Tus respuestas deben ser claras, concisas y con formato legible (puedes usar emojís con moderación para un tono amigable).
"""

def generar_respuesta_fallback(mensaje: str, productos_db: List[str] = None) -> str:
    """
    Motor de respuesta inteligente basado en intenciones para cuando no hay API Key de IA configurada
    o si falla la conexión a la API externa.
    """
    msg = mensaje.lower().strip()
    
    # Saludos
    if any(k in msg for k in ["hola", "buenas", "buen dia", "buenas tardes", "buenas noches", "saludos", "que tal"]):
        return "¡Hola! 👋 Bienvenid@ a **LudAngel Games**. Soy tu asistente virtual. ¿En qué te puedo ayudar hoy? Puedes preguntarme por nuestro catálogo de juegos, consolas, servicios técnicos o cómo realizar tu compra."

    # Consolas y productos
    if any(k in msg for k in ["producto", "catalogo", "consolas", "ps5", "playstation", "xbox", "switch", "nintendo", "juegos", "controles", "mandos"]):
        prods_text = ""
        if productos_db:
            prods_text = f"\nAlgunos de nuestros productos destacados son: {', '.join(productos_db[:5])}."
        return f"🎮 En **LudAngel Games** contamos con lo último en consolas (PS5, Xbox Series X/S, Nintendo Switch OLED), los mejores títulos de videojuegos (EA Sports FC, God of War Ragnarök, Spider-Man 2, Mario Kart) y accesorios de alta gama.{prods_text}\n\nPuedes explorar todo el catálogo completo en la sección **Productos** del menú."

    # Compras y envíos
    if any(k in msg for k in ["comprar", "compra", "envio", "envíos", "entrega", "despacho", "pago", "nequi", "daviplata"]):
        return "🛒 **¿Cómo comprar en LudAngel Games?**\n1. Inicia sesión o regístrate en nuestra plataforma.\n2. Ve a la sección **Productos** y añade tus favoritos al carrito.\n3. Procede al pago seleccionando tu método preferido (Nequi, Daviplata, Tarjetas o Pago contra entrega).\n\n🚚 **Envíos:** Realizamos despachos a todo el país con entrega en 24 a 48 horas hábiles."

    # PQRS
    if any(k in msg for k in ["pqrs", "queja", "reclamo", "peticion", "sugerencia", "garantia", "devolucion"]):
        return "📋 **Atención a PQRS y Garantías:**\nPara enviar una Petición, Queja, Reclamo o Sugerencia, puedes ingresar a tu cuenta de cliente y dirigirte al módulo **PQRS**. Nuestro equipo atenderá tu solicitud en un plazo máximo de 24 horas hábiles."

    # Horarios y contacto
    if any(k in msg for k in ["horario", "contacto", "ubicacion", "donde estan", "telefono", "whatsapp", "direccion"]):
        return "📍 **Contacto y Horarios de LudAngel Games:**\n- 🕒 **Horario:** Lunes a Sábado de 9:00 AM a 7:00 PM.\n- 📲 **WhatsApp Directo:** Puedes usar el botón verde flotante en la esquina de la pantalla.\n- 📧 **Correo:** contacto@ludangelgames.com"

    # Gracias / Despedida
    if any(k in msg for k in ["gracias", "agradecido", "excelente", "chao", "hasta luego", "adios"]):
        return "¡Con mucho gusto! 😊 Estamos para servirte. ¡Que tengas un excelente día y mucho juego! 🎮✨"

    # Respuesta general
    return "Entiendo tu consulta. En **LudAngel Games** estamos listos para ayudarte con tus compras de videojuegos, consolas, accesorios y servicios técnicos. ¿Te gustaría saber más sobre nuestros productos disponibles, métodos de pago o cómo radicar una PQRS?"


@router.post("/chat", response_model=ChatResponse, summary="Chatbot interactivo con Inteligencia Artificial")

async def chat_con_ia(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Endpoint seguro para interactuar con la IA del Chatbot (REQ-18, REQ-19).
    Lee la API Key desde el archivo `.env` del servidor de backend sin exponerla jamás al cliente.
    """
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    
    # Obtener algunos productos de la BD para personalizar contexto
    prod_names = []
    try:
        productos = db.query(Producto).filter(Producto.estado == True).limit(8).all()
        prod_names = [p.nombre for p in productos]
    except Exception:
        pass

    # 1. Intentar llamar a Google Gemini API si existe la llave
    if gemini_key:
        try:
            # Usar Gemini 1.5 / 2.0 API REST oficial
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            
            # Construir historial de mensajes
            contents = []
            
            # System prompt inicial
            contexto_db = f"\nProductos actuales disponibles en tienda: {', '.join(prod_names)}" if prod_names else ""
            system_prompt = SYSTEM_INSTRUCTION + contexto_db
            
            # Construir conversación
            contents.append({
                "role": "user",
                "parts": [{"text": f"Instrucciones del sistema:\n{system_prompt}\n\nMensaje del usuario: {request.mensaje}"}]
            })
            
            res = httpx.post(url, json={"contents": contents}, timeout=10.0)
            if res.status_code == 200:
                data = res.json()
                candidates = data.get("candidates", [])
                if candidates and "content" in candidates[0]:
                    parts = candidates[0]["content"].get("parts", [])
                    if parts and "text" in parts[0]:
                        return ChatResponse(respuesta=parts[0]["text"], origen="ai")
        except Exception as e:
            print(f"Error al conectar con Gemini API: {e}")

    # 2. Intentar llamar a OpenAI API si existe la llave
    if openai_key:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {openai_key}",
                "Content-Type": "application/json"
            }
            contexto_db = f"\nProductos disponibles: {', '.join(prod_names)}" if prod_names else ""
            messages = [
                {"role": "system", "content": SYSTEM_INSTRUCTION + contexto_db},
                {"role": "user", "content": request.mensaje}
            ]
            res = httpx.post(url, headers=headers, json={"model": "gpt-3.5-turbo", "messages": messages}, timeout=10.0)
            if res.status_code == 200:
                data = res.json()
                texto = data["choices"][0]["message"]["content"]
                return ChatResponse(respuesta=texto, origen="ai")
        except Exception as e:
            print(f"Error al conectar con OpenAI API: {e}")

    # 3. Fallback inteligente si no hay API Key activa o si fallaron las llamadas externas
    respuesta_local = generar_respuesta_fallback(request.mensaje, prod_names)
    return ChatResponse(respuesta=respuesta_local, origen="fallback")



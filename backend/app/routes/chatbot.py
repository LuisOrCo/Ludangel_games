import os
import re
import unicodedata
import httpx
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from dotenv import load_dotenv

from ..database import get_db
from ..schemas import ChatRequest, ChatResponse
from ..models import Producto

load_dotenv()

router = APIRouter(prefix="/chatbot", tags=["Chatbot IA"])

# Prompt del sistema para contextualizar a la IA sobre LudAngel Games
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
- Tus respuestas deben ser claras, concisas y con formato legible (puedes usar emojis y viñetas para que sea visualmente atractivo).
"""

# Palabras clave del dominio de LudAngel Games (Gaming, Tienda, Soporte, Servicios y Cortesía)
PALABRAS_CLAVE_DOMINIO = [
    # Consolas, plataformas y gaming general
    "juego", "videojuego", "gamer", "gaming", "consola", "playstation", "ps5", "ps4", "ps3", "ps2",
    "xbox", "series x", "series s", "one", "360", "nintendo", "switch", "oled", "lite", "gameboy",
    "mario", "zelda", "pokemon", "fifa", "ea sports", "fc 24", "fc 25", "fc 26", "gta", "grand theft auto",
    "god of war", "spider man", "spiderman", "halo", "resident evil", "fortnite", "fornite", "call of duty",
    "cod", "warzone", "minecraft", "roblox", "elden ring", "cyberpunk", "assassin", "sonic",
    "mando", "control", "joystick", "dualsense", "dualshock", "auricular", "audifono", "headset",
    "teclado", "mouse", "monitor", "pantalla", "pc gamer", "silla gamer", "cable", "hdmi", "disco",
    "ssd", "memoria", "ram", "grafica", "gpu", "retro", "arcade", "steam", "gamepass", "ps plus",

    # Tienda, compras, pagos, envíos
    "tienda", "ludangel", "ludbot", "producto", "catalogo", "articulo", "precio", "costo", "valor",
    "vale", "cuesta", "cuanto", "cotizar", "comprar", "compra", "venta", "vender", "pagar", "pago",
    "metodo", "nequi", "daviplata", "bancolombia", "tarjeta", "debito", "credito", "efectivo",
    "contraentrega", "cuota", "carrito", "stock", "disponible", "disponibilidad", "agotado",
    "despacho", "envio", "envios", "entrega", "domicilio", "flete", "garantia", "factura",
    "devolucion", "reembolso", "pedido", "orden", "rastreo", "seguimiento", "cuenta", "registro",
    "registrarse", "iniciar sesion", "login", "perfil", "descuento", "oferta", "promocion",

    # Servicios técnicos, mantenimiento, PQRS y contacto
    "servicio", "tecnico", "mantenimiento", "reparacion", "reparar", "arreglo", "arreglar", "soporte",
    "limpieza", "pasta termica", "pqrs", "peticion", "queja", "reclamo", "sugerencia", "ayuda",
    "atencion", "asesor", "contacto", "whatsapp", "correo", "email", "telefono", "celular",
    "horario", "abren", "cierran", "direccion", "ubicacion", "donde estan", "quienes son",
    "local", "sede", "bogota", "medellin", "cali", "colombia",

    # Cortesía, saludos y despedidas
    "hola", "buenas", "buen dia", "buenas tardes", "buenas noches", "saludos", "que tal",
    "hey", "como estas", "quien eres", "que haces", "gracias", "muchas gracias", "adios",
    "chao", "hasta luego", "bye", "ok", "vale", "perfecto", "listo"
]

def normalizar_texto(texto: str) -> str:
    """Elimina acentos, pasa a minúsculas y remueve símbolos especiales para una comparación uniforme."""
    texto = texto.lower()
    texto = ''.join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn')
    texto = re.sub(r'[^a-z0-9\s]', ' ', texto)
    return " ".join(texto.split())

def es_pregunta_relacionada(mensaje: str, productos_db: List[str] = None) -> bool:
    """
    Verifica si el mensaje del usuario está relacionado con LudAngel Games (gaming, tienda, servicios, contacto)
    o productos de la base de datos antes de gastar tokens llamando a la API de Gemini.
    """
    msg_norm = normalizar_texto(mensaje)
    
    # 1. Verificar coincidencia con palabras clave del dominio
    for kw in PALABRAS_CLAVE_DOMINIO:
        kw_norm = normalizar_texto(kw)
        # Búsqueda como subcadena o coincidencia de término
        if kw_norm in msg_norm:
            return True

    # 2. Verificar si coincide con nombres de productos cargados de la base de datos
    if productos_db:
        for p in productos_db:
            p_norm = normalizar_texto(p)
            for palabra in p_norm.split():
                if len(palabra) >= 3 and palabra in msg_norm:
                    return True

    return False


MENSAJE_FUERA_DE_TEMA = (
    "🎮 ¡Hola! Soy **LudBot**, el asistente de inteligencia artificial exclusivo de **LudAngel Games**.\n\n"
    "Mi especialidad está enfocada 100% en el mundo gamer: videojuegos, consolas (PS5, Xbox, Nintendo Switch), "
    "accesorios, servicios técnicos, compras, envíos y atención al cliente de nuestra tienda.\n\n"
    "No tengo información sobre otros temas no relacionados, pero con mucho gusto te puedo asesorar: "
    "¿qué juego, consola o servicio gamer estás buscando hoy? ✨"
)


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
    Aplica filtro previo de relevancia para no gastar tokens de Gemini en preguntas fuera de contexto.
    """
    load_dotenv()
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    
    # Obtener productos de la BD para personalizar contexto y verificar relevancia
    prod_names = []
    try:
        productos = db.query(Producto).filter(Producto.estado == True).limit(10).all()
        prod_names = [p.nombre for p in productos]
    except Exception:
        pass

    # =========================================================================
    # FILTRO DE RELEVANCIA (Ahorro de tokens / Control de contexto de tienda)
    # =========================================================================
    if not es_pregunta_relacionada(request.mensaje, prod_names):
        return ChatResponse(respuesta=MENSAJE_FUERA_DE_TEMA, origen="filter")

    contexto_db = f"\nProductos actuales disponibles en tienda: {', '.join(prod_names)}" if prod_names else ""
    system_prompt = SYSTEM_INSTRUCTION + contexto_db

    # 1. Intentar llamar a Google Gemini API si existe la llave
    if gemini_key:
        modelos = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"]
        async with httpx.AsyncClient(timeout=12.0) as client:
            for modelo in modelos:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent?key={gemini_key}"
                    payload = {
                        "system_instruction": {
                            "parts": [{"text": system_prompt}]
                        },
                        "contents": [
                            {
                                "role": "user",
                                "parts": [{"text": request.mensaje}]
                            }
                        ],
                        "generationConfig": {
                            "temperature": 0.7,
                            "maxOutputTokens": 800
                        }
                    }
                    res = await client.post(url, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            if parts and "text" in parts[0]:
                                return ChatResponse(respuesta=parts[0]["text"], origen="ai")
                    else:
                        print(f"⚠️ Error Gemini ({modelo}) [{res.status_code}]: {res.text}")
                except Exception as e:
                    print(f"❌ Excepción conectando a Gemini ({modelo}): {e}")

    # 2. Intentar llamar a OpenAI API si existe la llave
    if openai_key:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {openai_key}",
                "Content-Type": "application/json"
            }
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.mensaje}
            ]
            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.post(
                    url,
                    headers=headers,
                    json={"model": "gpt-3.5-turbo", "messages": messages}
                )
                if res.status_code == 200:
                    data = res.json()
                    texto = data["choices"][0]["message"]["content"]
                    return ChatResponse(respuesta=texto, origen="ai")
                else:
                    print(f"⚠️ Error OpenAI [{res.status_code}]: {res.text}")
        except Exception as e:
            print(f"❌ Excepción conectando a OpenAI: {e}")

    # 3. Fallback inteligente si no hay API Key configurada o si fallaron las APIs externas
    respuesta_local = generar_respuesta_fallback(request.mensaje, prod_names)
    return ChatResponse(respuesta=respuesta_local, origen="fallback")




import logging
import os
import secrets
import smtplib
from datetime import datetime, timedelta
from email.message import EmailMessage

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import CodigoRecuperacion, Usuario, Rol
from ..schemas import (
    LoginRequest, LoginResponse, RegisterRequest, UsuarioResponse,
    SolicitarRecuperacionRequest, VerificarCodigoRecuperacionRequest,
    RestablecerContrasenaRequest,
)
from ..security import (
    hash_contrasena,
    verificar_contrasena,
    crear_token_acceso,
    get_current_user,
    SECRET_KEY,
    ALGORITHM,
)

logger = logging.getLogger(__name__)
CODIGO_RECUPERACION_MINUTOS = 10
MAX_INTENTOS_CODIGO = 5

router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def formatear_usuario_respuesta(usuario: Usuario) -> UsuarioResponse:
    """Convierte un modelo Usuario en UsuarioResponse incluyendo el nombre del rol."""
    rol_str = usuario.rol.nombre if usuario.rol else ""
    return UsuarioResponse(
        id_usuario=usuario.id_usuario,
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        tipo_documento=usuario.tipo_documento,
        numero_documento=usuario.numero_documento,
        direccion=usuario.direccion,
        telefono=usuario.telefono,
        correo=usuario.correo,
        id_rol=usuario.id_rol,
        rol=rol_str,
        estado=usuario.estado
    )


def enviar_codigo_recuperacion(destinatario: str, codigo: str) -> None:
    """
    Envía el código de recuperación.
    Soporta:
    1. Brevo HTTPS API (BREVO_API_KEY) - Recomendado para Railway Free/Trial (usa puerto 443 HTTPS, sin bloqueo de puertos).
    2. Resend HTTPS API (RESEND_API_KEY) - Alternativa HTTPS (puerto 443).
    3. SMTP tradicional (Gmail/Outlook) - Para entorno local o servidores con puertos SMTP habilitados.
    """
    brevo_api_key = (os.getenv("BREVO_API_KEY") or "").strip().strip('\'"')
    resend_api_key = (os.getenv("RESEND_API_KEY") or "").strip().strip('\'"')
    usuario_smtp = (os.getenv("SMTP_USER") or "").strip().strip('\'"')
    remitente = (os.getenv("SMTP_FROM") or usuario_smtp or "angelortegacorrea09@gmail.com").strip().strip('\'"')

    # --- 1. ENVÍO VÍA BREVO API (HTTPS / Puerto 443) ---
    if brevo_api_key:
        import httpx
        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            "accept": "application/json",
            "api-key": brevo_api_key,
            "content-type": "application/json"
        }
        sender_email = usuario_smtp or remitente
        payload = {
            "sender": {"name": "LudAngel Games", "email": sender_email},
            "to": [{"email": destinatario}],
            "subject": "Código de recuperación de contraseña - LudAngel Games",
            "htmlContent": (
                f"<div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; "
                f"background-color: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;'>"
                f"<h2 style='color: #38bdf8; margin-top: 0;'>LudAngel Games</h2>"
                f"<p style='font-size: 16px;'>Hola,</p>"
                f"<p style='color: #cbd5e1;'>Has solicitado restablecer tu contraseña. Tu código de verificación es:</p>"
                f"<div style='text-align: center; margin: 25px 0;'>"
                f"<span style='font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #38bdf8; "
                f"background: #1e293b; padding: 10px 24px; border-radius: 8px; border: 1px solid #0284c7; display: inline-block;'>"
                f"{codigo}</span>"
                f"</div>"
                f"<p style='color: #94a3b8; font-size: 14px;'>Este código es válido durante <strong>{CODIGO_RECUPERACION_MINUTOS} minutos</strong>.</p>"
                f"<p style='color: #64748b; font-size: 12px; margin-top: 20px;'>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>"
                f"</div>"
            ),
        }
        response = httpx.post(url, json=payload, headers=headers, timeout=12.0)
        if response.status_code not in (200, 201, 202):
            raise RuntimeError(f"Error Brevo API ({response.status_code}): {response.text}")
        return

    # --- 2. ENVÍO VÍA RESEND API (HTTPS / Puerto 443) ---
    if resend_api_key:
        import httpx
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {resend_api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "from": remitente if "@" in remitente and "gmail" not in remitente.lower() else "LudAngel Games <onboarding@resend.dev>",
            "to": [destinatario],
            "subject": "Código de recuperación de contraseña - LudAngel Games",
            "html": (
                f"<div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; "
                f"background-color: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;'>"
                f"<h2 style='color: #38bdf8; margin-top: 0;'>LudAngel Games</h2>"
                f"<p style='font-size: 16px;'>Hola,</p>"
                f"<p style='color: #cbd5e1;'>Has solicitado restablecer tu contraseña. Tu código de verificación es:</p>"
                f"<div style='text-align: center; margin: 25px 0;'>"
                f"<span style='font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #38bdf8; "
                f"background: #1e293b; padding: 10px 24px; border-radius: 8px; border: 1px solid #0284c7; display: inline-block;'>"
                f"{codigo}</span>"
                f"</div>"
                f"<p style='color: #94a3b8; font-size: 14px;'>Este código es válido durante <strong>{CODIGO_RECUPERACION_MINUTOS} minutos</strong>.</p>"
                f"<p style='color: #64748b; font-size: 12px; margin-top: 20px;'>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>"
                f"</div>"
            ),
        }
        response = httpx.post(url, json=payload, headers=headers, timeout=12.0)
        if response.status_code not in (200, 201, 202):
            raise RuntimeError(f"Error Resend API ({response.status_code}): {response.text}")
        return

    # --- 3. ENVÍO VÍA SMTP CLÁSICO ---
    host = (os.getenv("SMTP_HOST") or "").strip().strip('\'"')
    # Gmail muestra las contraseñas de aplicación en grupos de cuatro caracteres.
    clave_smtp = "".join((os.getenv("SMTP_PASSWORD") or "").strip().strip('\'"').split())
    puerto_str = (os.getenv("SMTP_PORT") or "587").strip().strip('\'"')
    puerto = int(puerto_str) if puerto_str.isdigit() else 587

    if not all([host, usuario_smtp, clave_smtp, remitente]):
        faltantes = []
        if not host: faltantes.append("SMTP_HOST")
        if not usuario_smtp: faltantes.append("SMTP_USER")
        if not clave_smtp: faltantes.append("SMTP_PASSWORD")
        if not remitente: faltantes.append("SMTP_FROM")
        raise RuntimeError(f"El servicio de correo no está configurado. Variables faltantes: {', '.join(faltantes)}")

    mensaje = EmailMessage()
    mensaje["Subject"] = "Código de recuperación de contraseña - LudAngel Games"
    mensaje["From"] = remitente
    mensaje["To"] = destinatario
    mensaje.set_content(
        f"Hola,\n\nTu código de recuperación es: {codigo}\n\n"
        f"Es válido durante {CODIGO_RECUPERACION_MINUTOS} minutos. "
        "No compartas este código con nadie. Si no solicitaste el cambio, ignora este mensaje."
    )

    use_ssl = os.getenv("SMTP_USE_SSL", "false").strip().strip('\'"').lower() in {"true", "1", "yes"} or puerto == 465
    use_tls = os.getenv("SMTP_USE_TLS", "true").strip().strip('\'"').lower() in {"true", "1", "yes"}

    if use_ssl:
        with smtplib.SMTP_SSL(host, puerto, timeout=15) as servidor:
            servidor.login(usuario_smtp, clave_smtp)
            servidor.send_message(mensaje)
    else:
        with smtplib.SMTP(host, puerto, timeout=15) as servidor:
            if use_tls:
                servidor.starttls()
            servidor.login(usuario_smtp, clave_smtp)
            servidor.send_message(mensaje)




@router.post("/password-recovery/request")
def solicitar_recuperacion(
    datos: SolicitarRecuperacionRequest, db: Session = Depends(get_db)
):
    """Genera un código de seis dígitos y lo envía al correo registrado."""
    usuario = db.query(Usuario).filter(Usuario.correo == datos.correo).first()

    # La misma respuesta evita revelar qué correos tienen una cuenta.
    respuesta = {"message": "Si el correo está registrado, recibirás un código de verificación."}
    if not usuario or not usuario.estado:
        return respuesta

    codigo = f"{secrets.randbelow(1_000_000):06d}"
    registro = CodigoRecuperacion(
        id_usuario=usuario.id_usuario,
        codigo_hash=hash_contrasena(codigo),
        expira_en=datetime.utcnow() + timedelta(minutes=CODIGO_RECUPERACION_MINUTOS),
    )
    db.add(registro)
    db.commit()

    try:
        enviar_codigo_recuperacion(usuario.correo, codigo)
    except Exception as exc:
        # El código no se puede adivinar; se invalida para no dejar uno activo sin envío.
        registro.usado = True
        db.commit()
        logger.exception("No fue posible enviar el código de recuperación: %s", exc)
        print(f"[ERROR SMTP RECUPERACION] Fallo al enviar correo: {exc}", flush=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No fue posible enviar el correo de recuperación. Intenta más tarde.",
        )

    return respuesta


@router.post("/password-recovery/verify")
def verificar_codigo_recuperacion(
    datos: VerificarCodigoRecuperacionRequest, db: Session = Depends(get_db)
):
    """Valida el código y devuelve una autorización temporal para cambiar la clave."""
    usuario = db.query(Usuario).filter(Usuario.correo == datos.correo).first()
    if not usuario:
        raise HTTPException(status_code=400, detail="El código es inválido o ha expirado.")

    codigo = (
        db.query(CodigoRecuperacion)
        .filter(CodigoRecuperacion.id_usuario == usuario.id_usuario)
        .order_by(CodigoRecuperacion.id_codigo.desc())
        .first()
    )
    ahora = datetime.utcnow()
    if (
        not codigo or codigo.usado or codigo.expira_en < ahora
        or codigo.intentos >= MAX_INTENTOS_CODIGO
    ):
        raise HTTPException(status_code=400, detail="El código es inválido o ha expirado.")

    if not verificar_contrasena(datos.codigo, codigo.codigo_hash):
        codigo.intentos += 1
        db.commit()
        raise HTTPException(status_code=400, detail="El código es inválido o ha expirado.")

    token = jwt.encode(
        {
            "sub": usuario.correo,
            "purpose": "password_recovery",
            "recovery_id": codigo.id_codigo,
            "exp": datetime.utcnow() + timedelta(minutes=CODIGO_RECUPERACION_MINUTOS),
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )
    return {"token_recuperacion": token, "message": "Código verificado correctamente."}


@router.post("/password-recovery/reset")
def restablecer_contrasena(
    datos: RestablecerContrasenaRequest, db: Session = Depends(get_db)
):
    """Actualiza la contraseña después de una verificación correcta del código."""
    try:
        payload = jwt.decode(datos.token_recuperacion, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("purpose") != "password_recovery":
            raise JWTError()
        id_codigo = int(payload["recovery_id"])
    except (JWTError, KeyError, TypeError, ValueError):
        raise HTTPException(status_code=400, detail="La verificación expiró. Solicita un código nuevo.")

    codigo = db.query(CodigoRecuperacion).filter(CodigoRecuperacion.id_codigo == id_codigo).first()
    if not codigo or codigo.usado or codigo.expira_en < datetime.utcnow():
        raise HTTPException(status_code=400, detail="La verificación expiró. Solicita un código nuevo.")

    usuario = db.query(Usuario).filter(Usuario.id_usuario == codigo.id_usuario).first()
    if not usuario or not usuario.estado:
        raise HTTPException(status_code=400, detail="No fue posible actualizar la contraseña.")

    usuario.contrasena = hash_contrasena(datos.contrasena)
    codigo.usado = True
    db.commit()
    return {"message": "Contraseña actualizada correctamente. Ya puedes iniciar sesión."}


@router.post("/login", response_model=LoginResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Inicia sesión verificando correo y contraseña.
    Genera y retorna un token JWT válido por 24 horas y los datos del usuario.
    """
    usuario = db.query(Usuario).filter(Usuario.correo == login_data.correo).first()

    if not usuario or not verificar_contrasena(login_data.contrasena, usuario.contrasena):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not usuario.estado:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta se encuentra inactiva. Contacta al administrador."
        )

    rol_str = usuario.rol.nombre if usuario.rol else ""

    token = crear_token_acceso(
        data={
            "sub": usuario.correo,
            "id_usuario": usuario.id_usuario,
            "id_rol": usuario.id_rol,
            "nombre": usuario.nombre,
            "rol": rol_str
        }
    )

    usuario_formateado = formatear_usuario_respuesta(usuario)

    return LoginResponse(
        token=token,
        access_token=token,
        token_type="bearer",
        usuario=usuario_formateado,
        message="Inicio de sesión exitoso"
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
def registro_cliente(registro_data: RegisterRequest, db: Session = Depends(get_db)):
    """
    Registra una nueva cuenta de tipo Cliente (id_rol=3).
    Valida que correo y documento no estén previamente registrados.
    """
    # Verificar correo único
    if db.query(Usuario).filter(Usuario.correo == registro_data.correo).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado"
        )

    # Verificar documento único
    if db.query(Usuario).filter(Usuario.numero_documento == registro_data.numero_documento).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El número de documento ya se encuentra registrado"
        )

    # Rol por defecto para autoregistro: Cliente (3)
    rol_cliente = db.query(Rol).filter(Rol.id_rol == 3).first()
    id_rol_asignado = 3 if rol_cliente else 1

    contrasena_hash = hash_contrasena(registro_data.contrasena)

    nuevo_usuario = Usuario(
        nombre=registro_data.nombre,
        apellido=registro_data.apellido,
        tipo_documento=registro_data.tipo_documento,
        numero_documento=registro_data.numero_documento,
        direccion=registro_data.direccion,
        telefono=registro_data.telefono,
        correo=registro_data.correo,
        contrasena=contrasena_hash,
        id_rol=id_rol_asignado,
        estado=True
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    usuario_formateado = formatear_usuario_respuesta(nuevo_usuario)

    return {
        "message": "Usuario registrado exitosamente",
        "mensaje": "Usuario registrado exitosamente",
        "usuario": usuario_formateado
    }


@router.get("/me", response_model=UsuarioResponse)
def obtener_usuario_actual(usuario: Usuario = Depends(get_current_user)):
    """Retorna los datos del usuario autenticado a partir del JWT."""
    return formatear_usuario_respuesta(usuario)

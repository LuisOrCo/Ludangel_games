from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import Usuario, Rol
from ..schemas import LoginRequest, LoginResponse, RegisterRequest, UsuarioResponse
from ..security import (
    hash_contrasena,
    verificar_contrasena,
    crear_token_acceso,
    get_current_user
)

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

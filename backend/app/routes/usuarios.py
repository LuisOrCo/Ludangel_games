from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import Usuario, Rol
from ..schemas import (
    UsuarioCreate,
    UsuarioUpdate,
    UsuarioPerfilUpdate,
    UsuarioResponse,
    UsuarioListResponse,
    UsuarioEstadoUpdate
)
from ..security import (
    hash_contrasena,
    get_current_user,
    require_roles
)

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def formatear_usuario(usuario: Usuario) -> UsuarioResponse:
    """Convierte un modelo Usuario en UsuarioResponse inyectando el nombre del rol."""
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


# ==========================================
# PERFIL DEL USUARIO AUTENTICADO (REQ-19)
# Nota: estas rutas van antes de /{id_usuario}
# ==========================================

@router.get("/perfil")
def obtener_perfil(usuario: Usuario = Depends(get_current_user)):
    """Retorna los datos del perfil del usuario autenticado vía JWT."""
    return {"usuario": formatear_usuario(usuario)}
        
@router.put("/perfil")
def actualizar_perfil(
    perfil_data: UsuarioPerfilUpdate,
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Permite al usuario autenticado actualizar sus datos personales."""
    usuario_db = db.query(Usuario).filter(Usuario.id_usuario == usuario.id_usuario).first()
    if not usuario_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # Si cambia el correo, validar que no esté en uso por otro
    if perfil_data.correo and perfil_data.correo != usuario_db.correo:
        existente = db.query(Usuario).filter(
            Usuario.correo == perfil_data.correo,
            Usuario.id_usuario != usuario_db.id_usuario
        ).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo ya se encuentra registrado por otro usuario"
            )

    # Si cambia el documento, validar que no esté en uso por otro
    if perfil_data.numero_documento and perfil_data.numero_documento != usuario_db.numero_documento:
        existente = db.query(Usuario).filter(
            Usuario.numero_documento == perfil_data.numero_documento,
            Usuario.id_usuario != usuario_db.id_usuario
        ).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El número de documento ya se encuentra registrado por otro usuario"
            )

    datos = perfil_data.model_dump(exclude_unset=True)

    if "contrasena" in datos:
        if datos["contrasena"]:
            datos["contrasena"] = hash_contrasena(datos["contrasena"])
        else:
            del datos["contrasena"]

    for campo, valor in datos.items():
        setattr(usuario_db, campo, valor)

    db.commit()
    db.refresh(usuario_db)

    return {
        "usuario": formatear_usuario(usuario_db),
        "message": "¡Tus datos han sido actualizados correctamente!",
        "mensaje": "¡Tus datos han sido actualizados correctamente!"
    }


# ==========================================
# CRUD ADMINISTRATIVO DE USUARIOS (REQ-16)
# ==========================================

@router.get("/", response_model=UsuarioListResponse)
def obtener_usuarios(db: Session = Depends(get_db)):
    """Retorna la lista de todos los usuarios registrados."""
    usuarios = db.query(Usuario).all()
    lista_formateada = [formatear_usuario(u) for u in usuarios]
    return UsuarioListResponse(
        usuarios=lista_formateada,
        total=len(lista_formateada)
    )


@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def crear_usuario(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db)
):
    """Crea un nuevo usuario con cualquier rol disponible."""
    if db.query(Usuario).filter(Usuario.correo == usuario.correo).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo ya está registrado"
        )

    if db.query(Usuario).filter(Usuario.numero_documento == usuario.numero_documento).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El número de documento ya está registrado"
        )

    rol_existente = db.query(Rol).filter(Rol.id_rol == usuario.id_rol).first()
    if not rol_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El rol con ID {usuario.id_rol} no existe"
        )

    contrasena_hash = hash_contrasena(usuario.contrasena)

    nuevo_usuario = Usuario(
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        tipo_documento=usuario.tipo_documento,
        numero_documento=usuario.numero_documento,
        direccion=usuario.direccion,
        telefono=usuario.telefono,
        correo=usuario.correo,
        contrasena=contrasena_hash,
        id_rol=usuario.id_rol,
        estado=True
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return formatear_usuario(nuevo_usuario)


@router.get("/{id_usuario}", response_model=UsuarioResponse)
def obtener_usuario(
    id_usuario: int,
    db: Session = Depends(get_db)
):
    """Obtiene el detalle de un usuario por su ID."""
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {id_usuario} no encontrado"
        )
    return formatear_usuario(usuario)


@router.put("/{id_usuario}", response_model=UsuarioResponse)
def actualizar_usuario(
    id_usuario: int,
    usuario_update: UsuarioUpdate,
    db: Session = Depends(get_db)
):
    """Actualiza la información de un usuario específico."""
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {id_usuario} no encontrado"
        )

    if usuario_update.correo is not None and usuario_update.correo != usuario.correo:
        if db.query(Usuario).filter(Usuario.correo == usuario_update.correo, Usuario.id_usuario != id_usuario).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo ya está registrado por otro usuario"
            )

    if usuario_update.numero_documento is not None and usuario_update.numero_documento != usuario.numero_documento:
        if db.query(Usuario).filter(Usuario.numero_documento == usuario_update.numero_documento, Usuario.id_usuario != id_usuario).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El número de documento ya está registrado por otro usuario"
            )

    if usuario_update.id_rol is not None:
        if not db.query(Rol).filter(Rol.id_rol == usuario_update.id_rol).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El rol con ID {usuario_update.id_rol} no existe"
            )

    datos_actualizados = usuario_update.model_dump(exclude_unset=True)

    if "contrasena" in datos_actualizados:
        nueva_contrasena = datos_actualizados["contrasena"]
        if nueva_contrasena:
            datos_actualizados["contrasena"] = hash_contrasena(nueva_contrasena)
        else:
            del datos_actualizados["contrasena"]

    for campo, valor in datos_actualizados.items():
        setattr(usuario, campo, valor)

    db.commit()
    db.refresh(usuario)

    return formatear_usuario(usuario)


@router.patch("/{id_usuario}/estado")
def cambiar_estado_usuario(
    id_usuario: int,
    estado_update: UsuarioEstadoUpdate,
    db: Session = Depends(get_db)
):
    """Activa o desactiva a un usuario."""
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {id_usuario} no encontrado"
        )

    usuario.estado = estado_update.estado
    db.commit()
    db.refresh(usuario)

    return {
        "mensaje": f"Estado del usuario actualizado a {'Activo' if usuario.estado else 'Inactivo'}",
        "message": f"Estado del usuario actualizado a {'Activo' if usuario.estado else 'Inactivo'}",
        "usuario": formatear_usuario(usuario)
    }


@router.delete("/{id_usuario}", status_code=status.HTTP_200_OK)
def eliminar_usuario(
    id_usuario: int,
    db: Session = Depends(get_db)
):
    """Elimina definitivamente a un usuario del sistema."""
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {id_usuario} no encontrado"
        )

    db.delete(usuario)
    db.commit()

    return {
        "mensaje": f"Usuario con ID {id_usuario} eliminado exitosamente",
        "message": f"Usuario con ID {id_usuario} eliminado exitosamente",
        "id_usuario": id_usuario
    }
import os
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Callable

import bcrypt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .database import SessionLocal

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "clave_secreta_super_segura_ludangel_games_2026_jwt")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

security_bearer = HTTPBearer(auto_error=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_contrasena(contrasena: str) -> str:
    """
    Hashea una contraseña utilizando bcrypt de forma directa.
    Bcrypt tiene un límite nativo de 72 bytes, por lo que se recorta a 72 bytes.
    """
    pwd_bytes = contrasena.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verificar_contrasena(contrasena_plana: str, contrasena_hasheada: str) -> bool:
    """
    Verifica si una contraseña en texto plano coincide con su hash bcrypt.
    """
    pwd_bytes = contrasena_plana.encode("utf-8")[:72]
    return bcrypt.checkpw(pwd_bytes, contrasena_hasheada.encode("utf-8"))


def crear_token_acceso(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Genera un JSON Web Token (JWT) firmado con algoritmo HS256.
    """
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "iat": now})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token


def decodificar_token(token: str) -> dict:
    """
    Decodifica y valida la firma y expiración de un JWT.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token de autenticación ha expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación inválido o alterado",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db),
):
    """
    Dependencia FastAPI que obtiene y valida el usuario actual mediante el JWT Bearer.
    """
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se proporcionó token de autenticación",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decodificar_token(auth.credentials)
    correo: Optional[str] = payload.get("sub")
    if correo is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales de token inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    from .models import Usuario

    usuario = db.query(Usuario).filter(Usuario.correo == correo).first()
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El usuario asociado al token no existe",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not usuario.estado:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario se encuentra inactivo en el sistema",
        )

    return usuario


def require_roles(roles_permitidos: List[int]) -> Callable:
    """
    Retorna una dependencia que restringe el acceso según los roles especificados:
    1: Administrador, 2: Empleado, 3: Cliente
    """
    def check_role(usuario = Depends(get_current_user)):
        if usuario.id_rol not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes los permisos requeridos para realizar esta acción",
            )
        return usuario

    return check_role

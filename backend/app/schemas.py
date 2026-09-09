from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List


# ==========================================
# AUTENTICACIÓN
# ==========================================

class LoginRequest(BaseModel):
    correo: EmailStr
    contrasena: str


class RegisterRequest(BaseModel):
    nombre: str
    apellido: str
    tipo_documento: str
    numero_documento: str
    direccion: str
    telefono: str
    correo: EmailStr
    contrasena: str


# ==========================================
# USUARIOS
# ==========================================

class UsuarioBase(BaseModel):
    nombre: str
    apellido: str
    tipo_documento: str
    numero_documento: str
    direccion: str
    telefono: str
    correo: EmailStr
    id_rol: int


class UsuarioCreate(UsuarioBase):
    contrasena: str


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    tipo_documento: Optional[str] = None
    numero_documento: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[EmailStr] = None
    contrasena: Optional[str] = None
    id_rol: Optional[int] = None
    estado: Optional[bool] = None


class UsuarioPerfilUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    tipo_documento: Optional[str] = None
    numero_documento: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[EmailStr] = None
    contrasena: Optional[str] = None


class UsuarioEstadoUpdate(BaseModel):
    estado: bool


class UsuarioResponse(UsuarioBase):
    id_usuario: int
    estado: bool
    rol: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class UsuarioListResponse(BaseModel):
    usuarios: List[UsuarioResponse]
    total: int


class LoginResponse(BaseModel):
    token: str
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioResponse
    message: str = "Inicio de sesión exitoso"


# ==========================================
# PRODUCTOS
# ==========================================

class ProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    stock: int = 0
    imagen: Optional[str] = None


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[int] = None
    imagen: Optional[str] = None
    estado: Optional[bool] = None


class ProductoEstadoUpdate(BaseModel):
    estado: bool


class ProductoResponse(ProductoBase):
    id_producto: int
    estado: bool

    model_config = ConfigDict(from_attributes=True)


class ProductoListResponse(BaseModel):
    productos: List[ProductoResponse]
    total: int


# ==========================================
# SERVICIOS (REQ-04 y REQ-14)
# ==========================================

class ServicioBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    duracion: Optional[str] = None


class ServicioCreate(ServicioBase):
    pass


class ServicioUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    duracion: Optional[str] = None
    estado: Optional[bool] = None


class ServicioEstadoUpdate(BaseModel):
    estado: bool


class ServicioResponse(ServicioBase):
    id_servicio: int
    estado: bool

    model_config = ConfigDict(from_attributes=True)


class ServicioListResponse(BaseModel):
    servicios: List[ServicioResponse]
    total: int
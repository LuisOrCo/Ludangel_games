from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator
from typing import Optional, List
from datetime import datetime


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
    fecha_creacion: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("rol", mode="before")
    @classmethod
    def convert_rol(cls, v):
        if hasattr(v, "nombre"):
            return v.nombre
        return str(v) if v is not None else None


class UsuarioListResponse(BaseModel):
    usuarios: List[UsuarioResponse]
    total: int


class LoginResponse(BaseModel):
    token: str
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioResponse
    message: str = "Inicio de sesión exitoso"


class SolicitarRecuperacionRequest(BaseModel):
    correo: EmailStr


class VerificarCodigoRecuperacionRequest(BaseModel):
    correo: EmailStr
    codigo: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")


class RestablecerContrasenaRequest(BaseModel):
    token_recuperacion: str = Field(min_length=1)
    contrasena: str = Field(min_length=9, max_length=72)


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


# ==========================================
# VENTAS Y DETALLES
# ==========================================

class DetalleVentaCreate(BaseModel):
    id_producto: int
    cantidad: int = Field(gt=0)


class DetalleVentaResponse(BaseModel):
    id_detalle: int
    id_producto: int
    cantidad: int
    precio_unitario: float
    subtotal: float
    producto: Optional[ProductoResponse] = None

    model_config = ConfigDict(from_attributes=True)


class VentaCreate(BaseModel):
    metodo_pago: str = "Efectivo"
    detalles: List[DetalleVentaCreate]


class VentaResponse(BaseModel):
    id_venta: int
    id_usuario: int
    fecha_venta: Optional[datetime] = None
    total: float
    metodo_pago: str
    estado: str
    usuario: Optional[UsuarioResponse] = None
    detalles: List[DetalleVentaResponse] = []

    model_config = ConfigDict(from_attributes=True)


class VentaListResponse(BaseModel):
    ventas: List[VentaResponse]
    total: int


# ==========================================
# PQRS
# ==========================================

class PQRCreate(BaseModel):
    tipo: str = "Peticion"
    asunto: str = Field(min_length=3, max_length=150)
    descripcion: str = Field(min_length=5)


class PQRResponder(BaseModel):
    respuesta: str = Field(min_length=2)
    estado: str = "Resuelto"


class PQRResponse(BaseModel):
    id_pqr: int
    id_usuario: int
    tipo: str
    asunto: str
    descripcion: str
    estado: str
    respuesta: Optional[str] = None
    fecha_creacion: Optional[datetime] = None
    fecha_respuesta: Optional[datetime] = None
    usuario: Optional[UsuarioResponse] = None

    model_config = ConfigDict(from_attributes=True)


class PQRListResponse(BaseModel):
    pqrs: List[PQRResponse]
    total: int


# ==========================================
# CHATBOT IA (REQ-17, REQ-18)
# ==========================================

class ChatMessageHistory(BaseModel):
    role: str  # "user" o "model" / "assistant"
    content: str


class ChatRequest(BaseModel):
    mensaje: str = Field(..., min_length=1, description="Mensaje del usuario para el chatbot")
    historial: Optional[List[ChatMessageHistory]] = None


class ChatResponse(BaseModel):
    respuesta: str
    origen: str = "ai"  # "ai" o "fallback"



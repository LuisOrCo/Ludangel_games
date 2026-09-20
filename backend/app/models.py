from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    Text,
    Numeric,
    DateTime,
    func
)
from sqlalchemy.orm import relationship

from .database import Base


class Rol(Base):
    __tablename__ = "roles"

    id_rol = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(50), nullable=False, unique=True)
    descripcion = Column(String(255), nullable=True)
    estado = Column(Boolean, nullable=False, default=True)

    usuarios = relationship("Usuario", back_populates="rol")
    permisos = relationship(
        "Permiso",
        secondary="rol_permisos",
        back_populates="roles"
    )


class Permiso(Base):
    __tablename__ = "permisos"

    id_permiso = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False, unique=True)
    descripcion = Column(String(255), nullable=True)
    estado = Column(Boolean, nullable=False, default=True)

    roles = relationship(
        "Rol",
        secondary="rol_permisos",
        back_populates="permisos"
    )


class RolPermiso(Base):
    __tablename__ = "rol_permisos"

    id_rol = Column(
        Integer,
        ForeignKey("roles.id_rol", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True
    )

    id_permiso = Column(
        Integer,
        ForeignKey("permisos.id_permiso", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True
    )

class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, autoincrement=True)

    nombre = Column(String(50), nullable=False)
    apellido = Column(String(50), nullable=False)

    tipo_documento = Column(String(20), nullable=False)
    numero_documento = Column(String(20), nullable=False, unique=True)

    direccion = Column(String(150), nullable=False)
    telefono = Column(String(20), nullable=False)

    correo = Column(String(100), nullable=False, unique=True)

    contrasena = Column(String(255), nullable=False)

    id_rol = Column(
        Integer,
        ForeignKey("roles.id_rol", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False
    )

    estado = Column(Boolean, nullable=False, default=True)

    fecha_creacion = Column(
        DateTime,
        server_default=func.now()
    )

    fecha_actualizacion = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )

    rol = relationship("Rol", back_populates="usuarios")
    codigos_recuperacion = relationship(
        "CodigoRecuperacion",
        back_populates="usuario",
        cascade="all, delete-orphan"
    )
    ventas = relationship("Venta", back_populates="usuario")
    pqrs = relationship("PQR", back_populates="usuario")


    @property
    def rol_nombre(self) -> str:
        return self.rol.nombre if self.rol else ""


class CodigoRecuperacion(Base):
    """Código temporal usado exclusivamente para restablecer una contraseña."""
    __tablename__ = "codigos_recuperacion"

    id_codigo = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(
        Integer,
        ForeignKey("usuarios.id_usuario", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
        index=True,
    )
    codigo_hash = Column(String(255), nullable=False)
    expira_en = Column(DateTime, nullable=False)
    intentos = Column(Integer, nullable=False, default=0)
    usado = Column(Boolean, nullable=False, default=False)
    fecha_creacion = Column(DateTime, server_default=func.now())

    usuario = relationship("Usuario", back_populates="codigos_recuperacion")


class Producto(Base):
    __tablename__ = "productos"

    id_producto = Column(Integer, primary_key=True, autoincrement=True)

    nombre = Column(String(100), nullable=False)

    descripcion = Column(Text, nullable=True)

    precio = Column(Numeric(10, 2), nullable=False)

    stock = Column(Integer, nullable=False, default=0)

    imagen = Column(String(255), nullable=True)

    estado = Column(Boolean, nullable=False, default=True)

    fecha_creacion = Column(
        DateTime,
        server_default=func.now()
    )

    fecha_actualizacion = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )


class Venta(Base):
    __tablename__ = "ventas"

    id_venta = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(
        Integer,
        ForeignKey("usuarios.id_usuario", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False
    )
    fecha_venta = Column(DateTime, server_default=func.now())
    total = Column(Numeric(10, 2), nullable=False)
    metodo_pago = Column(String(50), nullable=False, default="Efectivo")
    estado = Column(String(20), nullable=False, default="Completada")

    usuario = relationship("Usuario", back_populates="ventas")
    detalles = relationship("DetalleVenta", back_populates="venta", cascade="all, delete-orphan")


class DetalleVenta(Base):
    __tablename__ = "detalle_ventas"

    id_detalle = Column(Integer, primary_key=True, autoincrement=True)
    id_venta = Column(
        Integer,
        ForeignKey("ventas.id_venta", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False
    )
    id_producto = Column(
        Integer,
        ForeignKey("productos.id_producto", ondelete="RESTRICT", onupdate="CASCADE"),
        nullable=False
    )
    cantidad = Column(Integer, nullable=False, default=1)
    precio_unitario = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)

    venta = relationship("Venta", back_populates="detalles")
    producto = relationship("Producto")


class PQR(Base):
    __tablename__ = "pqrs"

    id_pqr = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(
        Integer,
        ForeignKey("usuarios.id_usuario", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False
    )
    tipo = Column(String(20), nullable=False, default="Peticion")
    asunto = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=False)
    estado = Column(String(20), nullable=False, default="Pendiente")
    respuesta = Column(Text, nullable=True)
    fecha_creacion = Column(DateTime, server_default=func.now())
    fecha_respuesta = Column(DateTime, nullable=True, onupdate=func.now())

    usuario = relationship("Usuario", back_populates="pqrs")


class Servicio(Base):
    __tablename__ = "servicios"

    id_servicio = Column(Integer, primary_key=True, autoincrement=True)

    nombre = Column(String(100), nullable=False)

    descripcion = Column(Text, nullable=True)

    precio = Column(Numeric(10, 2), nullable=False)

    duracion = Column(String(50), nullable=True)

    estado = Column(Boolean, nullable=False, default=True)

    fecha_creacion = Column(
        DateTime,
        server_default=func.now()
    )

    fecha_actualizacion = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )


# Crear automáticamente tablas faltantes en la base de datos (como servicios)
from .database import engine
Base.metadata.create_all(bind=engine)

print("Tablas reconocidas por SQLAlchemy:")

for tabla in Base.metadata.tables:
    print("-", tabla)

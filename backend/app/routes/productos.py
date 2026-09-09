from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import Producto
from ..schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoResponse,
    ProductoListResponse,
    ProductoEstadoUpdate
)

router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=ProductoListResponse)
def listar_productos(db: Session = Depends(get_db)):
    """Retorna la lista de productos disponibles en el catálogo."""
    productos = db.query(Producto).all()
    return ProductoListResponse(
        productos=productos,
        total=len(productos)
    )


@router.get("/{id_producto}", response_model=ProductoResponse)
def obtener_producto(id_producto: int, db: Session = Depends(get_db)):
    """Obtiene un producto por su ID."""
    producto = db.query(Producto).filter(Producto.id_producto == id_producto).first()
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {id_producto} no encontrado"
        )
    return producto


@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_producto(producto: ProductoCreate, db: Session = Depends(get_db)):
    """Crea un nuevo producto en el catálogo."""
    nuevo_producto = Producto(
        nombre=producto.nombre,
        descripcion=producto.descripcion,
        precio=producto.precio,
        stock=producto.stock,
        imagen=producto.imagen,
        estado=True
    )
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)

    return {
        "message": "Producto creado exitosamente",
        "mensaje": "Producto creado exitosamente",
        "producto": ProductoResponse.model_validate(nuevo_producto)
    }


@router.put("/{id_producto}")
def actualizar_producto(
    id_producto: int,
    producto_update: ProductoUpdate,
    db: Session = Depends(get_db)
):
    """Actualiza la información de un producto."""
    producto = db.query(Producto).filter(Producto.id_producto == id_producto).first()
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {id_producto} no encontrado"
        )

    datos = producto_update.model_dump(exclude_unset=True)
    for campo, valor in datos.items():
        setattr(producto, campo, valor)

    db.commit()
    db.refresh(producto)

    return {
        "message": "Producto actualizado exitosamente",
        "mensaje": "Producto actualizado exitosamente",
        "producto": ProductoResponse.model_validate(producto)
    }


@router.patch("/{id_producto}/estado")
def cambiar_estado_producto(
    id_producto: int,
    estado_update: ProductoEstadoUpdate,
    db: Session = Depends(get_db)
):
    """Activa o desactiva un producto del catálogo."""
    producto = db.query(Producto).filter(Producto.id_producto == id_producto).first()
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {id_producto} no encontrado"
        )

    producto.estado = estado_update.estado
    db.commit()
    db.refresh(producto)

    return {
        "message": f"Producto {'activado' if producto.estado else 'desactivado'} exitosamente",
        "mensaje": f"Producto {'activado' if producto.estado else 'desactivado'} exitosamente",
        "producto": ProductoResponse.model_validate(producto)
    }


@router.delete("/{id_producto}")
def eliminar_producto(id_producto: int, db: Session = Depends(get_db)):
    """Elimina definitivamente un producto del catálogo."""
    producto = db.query(Producto).filter(Producto.id_producto == id_producto).first()
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {id_producto} no encontrado"
        )

    db.delete(producto)
    db.commit()

    return {
        "message": f"Producto con ID {id_producto} eliminado exitosamente",
        "mensaje": f"Producto con ID {id_producto} eliminado exitosamente",
        "id_producto": id_producto
    }

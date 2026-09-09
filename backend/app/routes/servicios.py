from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import Servicio
from ..schemas import (
    ServicioCreate,
    ServicioUpdate,
    ServicioResponse,
    ServicioListResponse,
    ServicioEstadoUpdate
)

router = APIRouter(
    prefix="/servicios",
    tags=["Servicios"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=ServicioListResponse)
def listar_servicios(db: Session = Depends(get_db)):
    """Retorna la lista de servicios ofrecidos."""
    servicios = db.query(Servicio).all()
    return ServicioListResponse(
        servicios=servicios,
        total=len(servicios)
    )


@router.get("/{id_servicio}", response_model=ServicioResponse)
def obtener_servicio(id_servicio: int, db: Session = Depends(get_db)):
    """Obtiene el detalle de un servicio por su ID."""
    servicio = db.query(Servicio).filter(Servicio.id_servicio == id_servicio).first()
    if not servicio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Servicio con ID {id_servicio} no encontrado"
        )
    return servicio


@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_servicio(servicio: ServicioCreate, db: Session = Depends(get_db)):
    """Registra un nuevo servicio."""
    nuevo_servicio = Servicio(
        nombre=servicio.nombre,
        descripcion=servicio.descripcion,
        precio=servicio.precio,
        duracion=servicio.duracion,
        estado=True
    )
    db.add(nuevo_servicio)
    db.commit()
    db.refresh(nuevo_servicio)

    return {
        "message": "Servicio creado exitosamente",
        "mensaje": "Servicio creado exitosamente",
        "servicio": ServicioResponse.model_validate(nuevo_servicio)
    }


@router.put("/{id_servicio}")
def actualizar_servicio(
    id_servicio: int,
    servicio_update: ServicioUpdate,
    db: Session = Depends(get_db)
):
    """Actualiza la información de un servicio."""
    servicio = db.query(Servicio).filter(Servicio.id_servicio == id_servicio).first()
    if not servicio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Servicio con ID {id_servicio} no encontrado"
        )

    datos = servicio_update.model_dump(exclude_unset=True)
    for campo, valor in datos.items():
        setattr(servicio, campo, valor)

    db.commit()
    db.refresh(servicio)

    return {
        "message": "Servicio actualizado exitosamente",
        "mensaje": "Servicio actualizado exitosamente",
        "servicio": ServicioResponse.model_validate(servicio)
    }


@router.patch("/{id_servicio}/estado")
def cambiar_estado_servicio(
    id_servicio: int,
    estado_update: ServicioEstadoUpdate,
    db: Session = Depends(get_db)
):
    """Activa o desactiva un servicio."""
    servicio = db.query(Servicio).filter(Servicio.id_servicio == id_servicio).first()
    if not servicio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Servicio con ID {id_servicio} no encontrado"
        )

    servicio.estado = estado_update.estado
    db.commit()
    db.refresh(servicio)

    return {
        "message": f"Servicio {'activado' if servicio.estado else 'desactivado'} exitosamente",
        "mensaje": f"Servicio {'activado' if servicio.estado else 'desactivado'} exitosamente",
        "servicio": ServicioResponse.model_validate(servicio)
    }


@router.delete("/{id_servicio}")
def eliminar_servicio(id_servicio: int, db: Session = Depends(get_db)):
    """Elimina definitivamente un servicio."""
    servicio = db.query(Servicio).filter(Servicio.id_servicio == id_servicio).first()
    if not servicio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Servicio con ID {id_servicio} no encontrado"
        )

    db.delete(servicio)
    db.commit()

    return {
        "message": f"Servicio con ID {id_servicio} eliminado exitosamente",
        "mensaje": f"Servicio con ID {id_servicio} eliminado exitosamente",
        "id_servicio": id_servicio
    }

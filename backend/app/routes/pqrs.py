from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime

from ..database import get_db
from ..models import PQR, Usuario
from ..schemas import PQRCreate, PQRResponse, PQRResponder, PQRListResponse
from ..security import get_current_user, require_roles

router = APIRouter(prefix="/pqrs", tags=["PQRS"])


@router.post("/", response_model=PQRResponse, status_code=status.HTTP_201_CREATED)
def crear_pqr(
    datos: PQRCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user)
):
    """
    Permite a cualquier usuario autenticado (Cliente, Empleado, Admin) radicar una PQR.
    """
    nueva_pqr = PQR(
        id_usuario=usuario_actual.id_usuario,
        tipo=datos.tipo,
        asunto=datos.asunto,
        descripcion=datos.descripcion,
        estado="Pendiente"
    )
    db.add(nueva_pqr)
    db.commit()
    db.refresh(nueva_pqr)
    return nueva_pqr


@router.get("/", response_model=PQRListResponse)
def listar_pqrs(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user)
):
    """
    Lista las PQRS.
    Clientes solo ven sus PQRS radicadas.
    Admin y Empleado ven todas las PQRS.
    """
    query = db.query(PQR)
    if usuario_actual.id_rol == 3:
        query = query.filter(PQR.id_usuario == usuario_actual.id_usuario)

    pqrs = query.order_by(PQR.fecha_creacion.desc()).all()
    return {"pqrs": pqrs, "total": len(pqrs)}


@router.get("/{id_pqr}", response_model=PQRResponse)
def obtener_pqr(
    id_pqr: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user)
):
    pqr = db.query(PQR).filter(PQR.id_pqr == id_pqr).first()
    if not pqr:
        raise HTTPException(status_code=404, detail="Solicitud PQR no encontrada.")

    if usuario_actual.id_rol == 3 and pqr.id_usuario != usuario_actual.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver esta PQR.")

    return pqr


@router.patch("/{id_pqr}/responder", response_model=PQRResponse)
def responder_pqr(
    id_pqr: int,
    datos: PQRResponder,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_roles([1, 2]))  # Admin y Empleado
):
    """
    Permite a Administradores y Empleados dar respuesta a una PQR y actualizar su estado.
    """
    pqr = db.query(PQR).filter(PQR.id_pqr == id_pqr).first()
    if not pqr:
        raise HTTPException(status_code=404, detail="Solicitud PQR no encontrada.")

    pqr.respuesta = datos.respuesta
    pqr.estado = datos.estado
    pqr.fecha_respuesta = datetime.datetime.now()

    db.commit()
    db.refresh(pqr)
    return pqr

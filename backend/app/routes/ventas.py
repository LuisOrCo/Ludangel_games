from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from io import BytesIO
import datetime

from ..database import get_db
from ..models import Venta, DetalleVenta, Producto, Usuario
from ..schemas import VentaCreate, VentaResponse, VentaListResponse
from ..security import get_current_user, require_roles

router = APIRouter(prefix="/ventas", tags=["Ventas y Facturación"])


@router.post("/", response_model=VentaResponse, status_code=status.HTTP_201_CREATED)
def crear_venta(
    datos: VentaCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user)
):
    """
    Registra una nueva venta a partir de los productos en el carrito.
    Verifica y descuenta stock automáticamente.
    """
    if not datos.detalles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La venta debe incluir al menos un producto."
        )

    total_acumulado = 0.0
    detalles_a_crear = []

    for item in datos.detalles:
        producto = db.query(Producto).filter(Producto.id_producto == item.id_producto).first()
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_44_NOT_FOUND if hasattr(status, 'HTTP_44_NOT_FOUND') else 404,
                detail=f"Producto con ID {item.id_producto} no encontrado."
            )

        if not producto.estado:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El producto '{producto.nombre}' no está disponible para la venta."
            )

        if producto.stock < item.cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente para '{producto.nombre}'. Disponible: {producto.stock}, solicitado: {item.cantidad}."
            )

        # Descontar stock
        producto.stock -= item.cantidad
        subtotal = float(producto.precio) * item.cantidad
        total_acumulado += subtotal

        detalles_a_crear.append({
            "id_producto": producto.id_producto,
            "cantidad": item.cantidad,
            "precio_unitario": float(producto.precio),
            "subtotal": subtotal
        })

    nueva_venta = Venta(
        id_usuario=usuario_actual.id_usuario,
        total=total_acumulado,
        metodo_pago=datos.metodo_pago,
        estado="Completada"
    )
    db.add(nueva_venta)
    db.flush()  # Para obtener el id_venta autogenerado

    for d in detalles_a_crear:
        detalle = DetalleVenta(
            id_venta=nueva_venta.id_venta,
            id_producto=d["id_producto"],
            cantidad=d["cantidad"],
            precio_unitario=d["precio_unitario"],
            subtotal=d["subtotal"]
        )
        db.add(detalle)

    db.commit()
    db.refresh(nueva_venta)
    return nueva_venta


@router.get("/", response_model=VentaListResponse)
def listar_ventas(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user)
):
    """
    Lista las ventas.
    Si el usuario es Cliente (rol=3), solo devuelve sus propias compras.
    Si es Admin (rol=1) o Empleado (rol=2), devuelve todas las ventas.
    """
    query = db.query(Venta)
    if usuario_actual.id_rol == 3:
        query = query.filter(Venta.id_usuario == usuario_actual.id_usuario)

    ventas = query.order_by(Venta.fecha_venta.desc()).all()
    return {"ventas": ventas, "total": len(ventas)}


@router.get("/{id_venta}", response_model=VentaResponse)
def obtener_venta(
    id_venta: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user)
):
    venta = db.query(Venta).filter(Venta.id_venta == id_venta).first()
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada.")

    if usuario_actual.id_rol == 3 and venta.id_usuario != usuario_actual.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver esta venta.")

    return venta


@router.get("/{id_venta}/factura-pdf")
def descargar_factura_pdf(
    id_venta: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user)
):
    """
    Genera la factura oficial en formato PDF para la venta indicada.
    """
    venta = db.query(Venta).filter(Venta.id_venta == id_venta).first()
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada.")

    if usuario_actual.id_rol == 3 and venta.id_usuario != usuario_actual.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes permiso para descargar esta factura.")

    # Generación de PDF (usando reportlab si está disponible, o formateador de PDF liviano)
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from reportlab.lib import colors

        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        # Encabezado
        p.setFont("Helvetica-Bold", 20)
        p.setFillColor(colors.HexColor("#4F46E5"))
        p.drawString(50, height - 50, "LUDANGEL GAMES")

        p.setFont("Helvetica-Bold", 12)
        p.setFillColor(colors.HexColor("#1F2937"))
        p.drawString(400, height - 50, f"FACTURA N° #{venta.id_venta:06d}")

        p.setFont("Helvetica", 9)
        p.drawString(50, height - 68, "Tienda de Videojuegos, Accesorios y Tecnología")
        p.drawString(50, height - 80, "NIT: 900.123.456-7 | PBX: (601) 555-0199")

        p.setStrokeColor(colors.HexColor("#E5E7EB"))
        p.setLineWidth(1)
        p.line(50, height - 90, width - 50, height - 90)

        # Datos del cliente y la venta
        p.setFont("Helvetica-Bold", 11)
        p.drawString(50, height - 115, "DATOS DEL CLIENTE:")
        p.setFont("Helvetica", 10)
        cliente = venta.usuario
        nombre_cliente = f"{cliente.nombre} {cliente.apellido}" if cliente else "Cliente General"
        doc_cliente = f"{cliente.tipo_documento}: {cliente.numero_documento}" if cliente else "N/A"
        correo_cliente = cliente.correo if cliente else "N/A"

        p.drawString(50, height - 130, f"Nombre: {nombre_cliente}")
        p.drawString(50, height - 145, f"Documento: {doc_cliente}")
        p.drawString(50, height - 160, f"Email: {correo_cliente}")

        p.setFont("Helvetica-Bold", 11)
        p.drawString(350, height - 115, "DETALLES DEL PAGO:")
        p.setFont("Helvetica", 10)
        fecha_str = venta.fecha_venta.strftime("%Y-%m-%d %H:%M:%S") if venta.fecha_venta else datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        p.drawString(350, height - 130, f"Fecha: {fecha_str}")
        p.drawString(350, height - 145, f"Método de Pago: {venta.metodo_pago}")
        p.drawString(350, height - 160, f"Estado: {venta.estado}")

        p.line(50, height - 175, width - 50, height - 175)

        # Tabla de productos
        y = height - 200
        p.setFillColor(colors.HexColor("#F3F4F6"))
        p.rect(50, y - 5, width - 100, 20, fill=True, stroke=False)
        p.setFillColor(colors.HexColor("#1F2937"))
        p.setFont("Helvetica-Bold", 10)
        p.drawString(60, y, "Producto")
        p.drawString(300, y, "Cant.")
        p.drawString(370, y, "P. Unitario")
        p.drawString(480, y, "Subtotal")

        y -= 25
        p.setFont("Helvetica", 10)
        for det in venta.detalles:
            nombre_prod = det.producto.nombre if det.producto else f"Producto #{det.id_producto}"
            p.drawString(60, y, nombre_prod[:35])
            p.drawString(300, y, str(det.cantidad))
            p.drawString(370, y, f"${det.precio_unitario:,.2f}")
            p.drawString(480, y, f"${det.subtotal:,.2f}")
            y -= 20

        p.line(50, y, width - 50, y)

        # Total
        y -= 25
        p.setFont("Helvetica-Bold", 12)
        p.setFillColor(colors.HexColor("#4F46E5"))
        p.drawString(280, y, "TOTAL FACTURADO:")
        p.drawRightString(width - 50, y, f"${float(venta.total):,.2f}")

        # Pie de página
        p.setFont("Helvetica-Oblique", 9)
        p.setFillColor(colors.HexColor("#6B7280"))
        p.drawCentredString(width / 2.0, 40, "¡Gracias por tu compra en LudAngel Games! Guarda esta factura para cualquier garantía.")

        p.showPage()
        p.save()
        pdf_bytes = buffer.getvalue()
        buffer.close()

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=Factura_LudAngel_{venta.id_venta}.pdf"}
        )

    except ImportError:
        # Fallback si reportlab no está instalado
        texto_factura = f"""
==================================================
                 LUDANGEL GAMES
                FACTURA N° #{venta.id_venta:06d}
==================================================
Fecha: {venta.fecha_venta}
Cliente: {venta.usuario.nombre if venta.usuario else ''} {venta.usuario.apellido if venta.usuario else ''}
Correo: {venta.usuario.correo if venta.usuario else ''}
Método de Pago: {venta.metodo_pago}
--------------------------------------------------
Ítems:
"""
        for det in venta.detalles:
            nombre = det.producto.nombre if det.producto else f"Producto #{det.id_producto}"
            texto_factura += f"- {nombre} x{det.cantidad}: ${det.subtotal:,.2f}\n"

        texto_factura += f"""--------------------------------------------------
TOTAL: ${float(venta.total):,.2f}
==================================================
        """
        return Response(
            content=texto_factura.encode("utf-8"),
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename=Factura_LudAngel_{venta.id_venta}.txt"}
        )

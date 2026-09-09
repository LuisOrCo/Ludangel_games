from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.auth import router as auth_router
from .routes.usuarios import router as usuarios_router
from .routes.productos import router as productos_router
from .routes.servicios import router as servicios_router

app = FastAPI(
    title="LudAngel Games API - SENA ADSO",
    description="API REST Full Stack con FastAPI, SQLAlchemy y JWT para LudAngel Games.",
    version="1.0.0"
)

# ==========================================
# CONFIGURACIÓN CORS (REQ-01 y REQ-08)
# Permite comunicación fluida con React / Vite
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# RUTAS CON PREFIJO /api/v1 (OFICIALES Y VISIBLES EN SWAGGER)
# ==========================================
app.include_router(auth_router, prefix="/api/v1")
app.include_router(usuarios_router, prefix="/api/v1")
app.include_router(productos_router, prefix="/api/v1")
app.include_router(servicios_router, prefix="/api/v1")

# ==========================================
# ALIASES COMPATIBILIDAD (OCULTOS EN SWAGGER PARA EVITAR DUPLICADOS)
# ==========================================
app.include_router(auth_router, prefix="/api", include_in_schema=False)
app.include_router(usuarios_router, prefix="/api", include_in_schema=False)
app.include_router(productos_router, prefix="/api", include_in_schema=False)
app.include_router(servicios_router, prefix="/api", include_in_schema=False)

app.include_router(auth_router, include_in_schema=False)
app.include_router(usuarios_router, include_in_schema=False)
app.include_router(productos_router, include_in_schema=False)
app.include_router(servicios_router, include_in_schema=False)


@app.get("/", tags=["General"])
def inicio():
    return {
        "mensaje": "LudAngel Games API funcionando correctamente",
        "version": "1.0.0",
        "documentacion": "/docs"
    }
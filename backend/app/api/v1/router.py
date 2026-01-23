from fastapi import APIRouter

from app.api.v1.endpoints import health, postmortems, generation

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(postmortems.router, prefix="/postmortems", tags=["postmortems"])
api_router.include_router(generation.router, prefix="/generation", tags=["generation"])

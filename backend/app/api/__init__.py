from .auth import router as auth_router
from .papers import router as papers_router
from .saved import router as saved_router
from .social import router as social_router
from .migrate import router as migrate_router

__all__ = [
    "auth_router",
    "papers_router",
    "saved_router",
    "social_router",
    "migrate_router"
]

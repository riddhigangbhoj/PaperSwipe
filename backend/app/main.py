from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .api import (
    auth_router,
    papers_router,
    saved_router,
    social_router,
    migrate_router
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="PaperSwipe API",
    description="Backend API for PaperSwipe - Tinder for Research Papers",
    version="1.0.0"
)

# Add CORS middleware
# Parse comma-separated origins string into list
allowed_origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(papers_router, prefix="/api")
app.include_router(saved_router, prefix="/api")
app.include_router(social_router, prefix="/api")
app.include_router(migrate_router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "PaperSwipe API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

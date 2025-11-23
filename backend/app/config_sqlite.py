from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database - Using SQLite for local development
    DATABASE_URL: str = "sqlite:///./paperswipe.db"

    # Redis - Optional for local development
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT Authentication
    SECRET_KEY: str = "dev-secret-key-change-in-production-12345678"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "*"]

    # arXiv API
    ARXIV_API_BASE: str = "https://export.arxiv.org/api/query"
    ARXIV_RATE_LIMIT_DELAY: int = 3

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

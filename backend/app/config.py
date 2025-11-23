from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    # Database - Default to SQLite for local development, PostgreSQL for production
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./paperswipe.db")

    # JWT Authentication
    SECRET_KEY: str = "dev-secret-key-change-in-production-12345678"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS - Comma-separated string, parsed in main.py
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,https://riddhigangbhoj.github.io,*"

    # arXiv API
    ARXIV_API_BASE: str = "https://export.arxiv.org/api/query"
    ARXIV_RATE_LIMIT_DELAY: int = 3

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()

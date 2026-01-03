from pydantic_settings import BaseSettings
from typing import Optional
import secrets

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "SIAMS - Smart Inventory & Accounts Management"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./siams.db"

    # JWT Settings
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

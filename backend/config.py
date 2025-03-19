import os
from pydantic_settings import BaseSettings
from typing import ClassVar
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()


class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./beehub.db")
    
    # JWT settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-jwt-token-generation")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # Default admin credentials
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")
    
    # App
    APP_PORT: int = int(os.getenv("APP_PORT", "8081"))
    
    # Discovery configuration
    DISCOVERY_ENABLED: bool = os.environ.get("DISCOVERY_ENABLED", "true").lower() == "true"
    DISCOVERY_PORT_RANGE_START: int = int(os.environ.get("DISCOVERY_PORT_RANGE_START", "5000"))
    DISCOVERY_PORT_RANGE_END: int = int(os.environ.get("DISCOVERY_PORT_RANGE_END", "5099"))
    DISCOVERY_SERVICE_TYPE: str = os.environ.get("DISCOVERY_SERVICE_TYPE", "beeapi")
    DISCOVERY_REFRESH_INTERVAL: int = int(os.environ.get("DISCOVERY_REFRESH_INTERVAL", "60"))

    # Param to mimic the bahaviour by just reading the content to get the urls
    DISCOVERY_URLS: str = os.environ.get("DISCOVERY_URLS", "http://localhost:5000")

settings = Settings()

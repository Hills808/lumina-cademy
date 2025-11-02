"""
Configurações do Sistema
Configurações gerais da aplicação
"""

from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configurações da aplicação"""
    
    # Aplicação
    APP_NAME: str = "LUMINA"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Banco de Dados
    DATABASE_URL: str = "postgresql://user:password@localhost/lumina"
    
    # Autenticação
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 horas
    
    # API
    API_PREFIX: str = "/api/v1"
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]
    
    # Email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # Uploads
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: list = ["pdf", "docx", "xlsx", "jpg", "png", "mp4"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

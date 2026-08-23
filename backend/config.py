import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "SwasthSaarthi - AyurSaarthi"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./swasthsaarthi.db")
    
    # API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    GROQ_API_KEY_PRIMARY: str = os.getenv("GROQ_API_KEY_PRIMARY", "")
    GROQ_API_KEY_SECONDARY: str = os.getenv("GROQ_API_KEY_SECONDARY", "")
    GROQ_API_KEY_FALLBACK: str = os.getenv("GROQ_API_KEY_FALLBACK", "")

    # SMS OTP (Fast2SMS)
    FAST2SMS_API_KEY: str = os.getenv("FAST2SMS_API_KEY", "")

    # Email OTP (Gmail SMTP with App Password)
    GMAIL_ADDRESS: str = os.getenv("GMAIL_ADDRESS", "")
    GMAIL_APP_PASSWORD: str = os.getenv("GMAIL_APP_PASSWORD", "")

    # JWT Auth
    JWT_SECRET: str = os.getenv("JWT_SECRET", "swasth_saarthi_super_secret_jwt_key_2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

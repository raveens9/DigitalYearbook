from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://neondb_owner:npg_I4T3XspQvCrz@ep-proud-bar-ahndn859-pooler.c-3.us-east-1.aws.neon.tech/neondb?ssl=require"
    
    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,https://your-frontend.vercel.app,https://your-app.up.railway.app"
    
    # Environment
    ENV: str = "development"
    
    # Google Cloud Storage
    GCS_PROJECT_ID: str = "digital-yearbook-485813"
    GCS_BUCKET_NAME: str = "digitalyearbook-media"
    GCS_CREDENTIALS_PATH: str = ""
    GCS_CREDENTIALS_JSON: str = ""  # Paste your JSON credentials here as a string
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:abhi1234@localhost/badal_db"
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Badal"
    CORS_ORIGINS: list = ["http://localhost:3000"]

    class Config:
        case_sensitive = True

settings = Settings()

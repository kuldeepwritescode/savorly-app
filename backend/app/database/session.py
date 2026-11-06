from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings


# Database Engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}  # Sirf SQLite ke liye zaroori hai
)

# Session Local
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Base class for Models
class Base(DeclarativeBase):
    pass


# Dependency (FastAPI mein use hoga)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
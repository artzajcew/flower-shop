# app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

# Используем переменную из .env файла, а не жестко прописанный URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./flower_shop.db")

# Для SQLite нужно добавить аргумент connect_args
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        echo=True,
        connect_args={"check_same_thread": False}  # Нужно для SQLite
    )
else:
    engine = create_engine(
        DATABASE_URL,
        echo=True,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Функция для получения сессии БД в эндпоинтах
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
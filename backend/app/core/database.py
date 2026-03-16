# app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Подключение к БД flower_shop_db (не postgres!)
DATABASE_URL = "postgresql://postgres:admin123@localhost:5432/flower_shop_db"

engine = create_engine(
    DATABASE_URL,
    echo=True,  # Показывает SQL запросы в консоли (удобно для отладки)
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
# migrate_passwords.py — положи в корень проекта (рядом с main.py)
from app.core.database import SessionLocal
from app.models.user import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def is_already_hashed(password: str) -> bool:
    """Проверяет, захеширован ли уже пароль (bcrypt хеши начинаются с $2b$)"""
    return password.startswith("$2b$") or password.startswith("$2a$")


def migrate_passwords():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Найдено пользователей: {len(users)}")

        migrated = 0
        skipped = 0

        for user in users:
            if not user.password:
                print(f"  ⚠️  Пользователь {user.id} ({user.email or user.phone}) — пароль пустой, пропускаем")
                skipped += 1
                continue

            if is_already_hashed(user.password):
                print(f"  ✓  Пользователь {user.id} ({user.email or user.phone}) — уже захеширован, пропускаем")
                skipped += 1
                continue

            # Хешируем plaintext пароль
            user.password = pwd_context.hash(user.password)
            migrated += 1
            print(f"  🔒  Пользователь {user.id} ({user.email or user.phone}) — захеширован")

        db.commit()
        print(f"\nГотово! Захеширowano: {migrated}, пропущено: {skipped}")

    except Exception as e:
        db.rollback()
        print(f"Ошибка: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrate_passwords()
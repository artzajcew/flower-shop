# generate_admin_hashes.py — запусти один раз, результат вставь в auth.py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

password = "meoow"
hashed = pwd_context.hash(password)
print(f"Хеш для пароля '{password}':")
print(hashed)
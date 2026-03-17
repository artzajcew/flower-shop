# app/api/v1/orders.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

from app.core.database import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate, OrderRead, OrderUpdate
from app.api.v1.auth import get_current_user

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


@router.post("/", response_model=OrderRead, status_code=201)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Создать новый заказ"""
    user = db.query(User).filter(User.id == current_user.get("id")).first()
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")

    good_ids = [item.good_id for item in order_data.items]
    products = db.query(Product).filter(Product.id.in_(good_ids)).all()
    products_dict = {p.id: p for p in products}

    for item in order_data.items:
        product = products_dict.get(item.good_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Товар с id {item.good_id} не найден")
        if product.quantity < item.count:
            raise HTTPException(status_code=400, detail=f"Товар '{product.name}' доступен только в количестве {product.quantity}")

    total_price = Decimal(0)
    for item in order_data.items:
        product = products_dict[item.good_id]
        total_price += product.price * item.count

    db_order = Order(
        user_id=user.id,
        delivery_date=order_data.delivery_date,
        delivery_address=order_data.delivery_address,
        recipient_name=order_data.recipient_name,
        recipient_phone=order_data.recipient_phone,
        total_price=total_price,
        status="Новый"
    )
    db.add(db_order)
    db.flush()

    for item in order_data.items:
        product = products_dict[item.good_id]
        order_item = OrderItem(
            order_id=db_order.id,
            good_id=item.good_id,
            count=item.count,
            price=product.price
        )
        db.add(order_item)
        product.quantity -= item.count

    db.commit()
    db.refresh(db_order)
    return db_order


@router.get("/", response_model=List[OrderRead])
def get_orders(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
):
    """Получить список заказов"""
    query = db.query(Order)

    if not current_user.get("is_admin", False):
        user = db.query(User).filter(User.id == current_user.get("id")).first()
        if not user:
            raise HTTPException(status_code=401, detail="Пользователь не найден")
        query = query.filter(Order.user_id == user.id)

    if status:
        query = query.filter(Order.status == status)

    orders = query.order_by(Order.order_date.desc()).offset(skip).limit(limit).all()
    return orders


@router.get("/{order_id}", response_model=OrderRead)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Получить заказ по ID"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Заказ с id {order_id} не найден")
    if not current_user.get("is_admin", False) and order.user_id != current_user.get("id"):
        raise HTTPException(status_code=403, detail="Нет доступа к этому заказу")
    return order


@router.patch("/{order_id}/status", response_model=OrderRead)
def update_order_status(
    order_id: int,
    status_data: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Изменить статус заказа"""
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Только администратор может изменять статус заказа")

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Заказ с id {order_id} не найден")

    if status_data.status:
        order.status = status_data.status

    db.commit()
    db.refresh(order)
    return order


# ПРОСТОЙ ПОИСК БЕЗ ВСЯКОЙ ВАЛИДАЦИИ
@router.get("/search")
def search_orders_simple(
    email: Optional[str] = None,
    phone: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Максимально простой поиск заказов"""
    print("="*50)
    print("ПОИСК ЗАКАЗОВ (УПРОЩЕННЫЙ)")
    print(f"email: {email}, phone: {phone}")

    # Если нет параметров - пустой список
    if not email and not phone:
        return []

    # Ищем пользователя
    user = None
    if email:
        user = db.query(User).filter(User.email == email).first()
        print(f"Поиск по email {email}: {'найден' if user else 'не найден'}")
    elif phone:
        user = db.query(User).filter(User.phone == phone).first()
        print(f"Поиск по phone {phone}: {'найден' if user else 'не найден'}")

    if not user:
        return []

    # Ищем заказы
    orders = db.query(Order).filter(Order.user_id == user.id).order_by(Order.order_date.desc()).all()
    print(f"Найдено заказов: {len(orders)}")

    # Формируем простой ответ
    result = []
    for order in orders:
        result.append({
            "id": order.id,
            "user_id": order.user_id,
            "order_date": str(order.order_date) if order.order_date else None,
            "delivery_date": str(order.delivery_date) if order.delivery_date else None,
            "delivery_address": order.delivery_address,
            "recipient_name": order.recipient_name,
            "recipient_phone": order.recipient_phone,
            "total_price": float(order.total_price) if order.total_price else 0,
            "status": order.status,
            "items": []
        })

    print("="*50)
    return result


# POST версия для совместимости
@router.post("/search")
def search_orders_simple_post(
    request: dict,
    db: Session = Depends(get_db)
):
    email = request.get('email')
    phone = request.get('phone')
    return search_orders_simple(email=email, phone=phone, db=db)
# app/api/v1/orders.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
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


def _build_order_response(order: Order, db: Session) -> dict:
    """Вспомогательная функция сборки ответа заказа с товарами"""
    order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    items = []
    for item in order_items:
        product = db.query(Product).filter(Product.id == item.good_id).first()
        items.append({
            "good_id": item.good_id,
            "count": item.count,
            "product_name": product.name if product else None,
            "price": float(product.price) if product else 0
        })
    return {
        "id": order.id,
        "user_id": order.user_id,
        "order_date": order.order_date,
        "delivery_date": order.delivery_date,
        "delivery_address": order.delivery_address,
        "recipient_name": order.recipient_name,
        "recipient_phone": order.recipient_phone,
        "total_price": float(order.total_price),
        "status": order.status,
        "items": items
    }


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

    # Загружаем все нужные продукты одним запросом
    good_ids = [item.good_id for item in order_data.items]
    products = db.query(Product).filter(Product.id.in_(good_ids)).with_for_update().all()
    products_dict = {p.id: p for p in products}

    # Валидация: наличие товаров и достаточность остатков
    for item in order_data.items:
        product = products_dict.get(item.good_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Товар с id {item.good_id} не найден")
        if product.quantity < item.count:
            raise HTTPException(
                status_code=400,
                detail=f"Товар '{product.name}' доступен только в количестве {product.quantity}"
            )

    # Считаем итоговую сумму
    total_price = Decimal(0)
    for item in order_data.items:
        product = products_dict[item.good_id]
        total_price += product.price * item.count

    # Создаём заказ
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
    db.flush()  # Получаем id заказа без коммита

    # Создаём позиции заказа и СПИСЫВАЕМ остатки
    for item in order_data.items:
        product = products_dict[item.good_id]

        order_item = OrderItem(
            order_id=db_order.id,
            good_id=item.good_id,
            count=item.count
        )
        db.add(order_item)

        # Явно изменяем объект, который отслеживается сессией
        product.quantity = product.quantity - item.count

    db.commit()  # Один коммит: и заказ, и позиции, и списание
    db.refresh(db_order)

    return _build_order_response(db_order, db)


@router.get("/search")
def search_orders_simple(
    email: Optional[str] = None,
    phone: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Поиск заказов по email или телефону (без авторизации)"""
    if not email and not phone:
        return []

    user = None
    if email:
        user = db.query(User).filter(User.email == email).first()
    elif phone:
        user = db.query(User).filter(User.phone == phone).first()

    if not user:
        return []

    orders = db.query(Order).filter(Order.user_id == user.id).order_by(Order.order_date.desc()).all()

    result = []
    for order in orders:
        order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        items = []
        for item in order_items:
            product = db.query(Product).filter(Product.id == item.good_id).first()
            items.append({
                "good_id": item.good_id,
                "count": item.count,
                "product_name": product.name if product else None,
                "price": float(product.price) if product else 0
            })
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
            "items": items
        })

    return result


@router.post("/search")
def search_orders_simple_post(request: dict, db: Session = Depends(get_db)):
    return search_orders_simple(email=request.get('email'), phone=request.get('phone'), db=db)


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
    return [_build_order_response(order, db) for order in orders]


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

    return _build_order_response(order, db)


@router.patch("/{order_id}/status", response_model=OrderRead)
def update_order_status(
    order_id: int,
    status_data: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Изменить статус заказа (только администратор)"""
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Только администратор может изменять статус заказа")

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Заказ с id {order_id} не найден")

    if status_data.status:
        order.status = status_data.status

    db.commit()
    db.refresh(order)
    return _build_order_response(order, db)
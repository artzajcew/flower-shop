# app/schemas/order.py
from pydantic import BaseModel, Field, validator
from datetime import datetime
from decimal import Decimal
from typing import List, Optional


class OrderItemCreate(BaseModel):
    good_id: int = Field(..., description="ID товара")
    count: int = Field(..., gt=0, description="Количество")


class OrderItemRead(BaseModel):
    good_id: int
    count: int
    # Убрали price из чтения, так как его нет в таблице
    # Цена будет браться из самого заказа (total_price)
    product_name: Optional[str] = None

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    delivery_date: datetime = Field(..., description="Дата и время доставки")
    delivery_address: str = Field(..., description="Адрес доставки")
    recipient_name: str = Field(..., description="Имя получателя")
    recipient_phone: str = Field(..., description="Телефон получателя")
    items: List[OrderItemCreate] = Field(..., description="Товары в заказе", min_items=1)

    @validator('delivery_date')
    def validate_delivery_date(cls, v):
        # Делаем оба datetime наивными для сравнения
        now = datetime.now()

        # Если v содержит часовой пояс, убираем его
        if v.tzinfo is not None:
            v = v.replace(tzinfo=None)

        if v < now:
            raise ValueError('Дата доставки не может быть в прошлом')
        return v


class OrderRead(BaseModel):
    id: int
    user_id: int
    order_date: datetime
    delivery_date: datetime
    delivery_address: str
    recipient_name: str
    recipient_phone: str
    total_price: Decimal
    status: str
    items: List[OrderItemRead]

    class Config:
        from_attributes = True


class OrderUpdate(BaseModel):
    status: Optional[str] = Field(None, description="Статус заказа")
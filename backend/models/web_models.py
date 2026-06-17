"""
Web-specific SQLAlchemy models — mirrors desktop models but adds user_id for multi-tenancy.
"""
from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Date, ForeignKey, Index,
)
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    initial_capital = Column(Float, default=100000.0)
    cash = Column(Float, default=100000.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    stocks = relationship("StockDB", back_populates="user")
    trades = relationship("TradeRecordDB", back_populates="user")
    orders = relationship("OrderDB", back_populates="user")


class StockDB(Base):
    __tablename__ = "web_stocks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    code = Column(String(20), nullable=False)
    name = Column(String(100), nullable=False)
    exchange = Column(String(20), default="US")
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_web_stocks_user_code", "user_id", "code", unique=True),
    )

    user = relationship("UserDB", back_populates="stocks")
    trades = relationship("TradeRecordDB", back_populates="stock")
    orders = relationship("OrderDB", back_populates="stock")


class TradeRecordDB(Base):
    __tablename__ = "web_trade_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    stock_id = Column(Integer, ForeignKey("web_stocks.id"), nullable=False, index=True)
    trade_date = Column(Date, nullable=False, index=True)
    trade_type = Column(String(10), nullable=False)
    shares = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    fee = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserDB", back_populates="trades")
    stock = relationship("StockDB", back_populates="trades")


class OrderDB(Base):
    __tablename__ = "web_orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    stock_id = Column(Integer, ForeignKey("web_stocks.id"), nullable=False, index=True)
    order_type = Column(String(20), nullable=False)
    side = Column(String(10), nullable=False)
    shares = Column(Integer, nullable=False)
    price = Column(Float, nullable=True)
    trigger_price = Column(Float, nullable=True)
    status = Column(String(20), default="pending", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("UserDB", back_populates="orders")
    stock = relationship("StockDB", back_populates="orders")

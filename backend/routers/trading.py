from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from backend.database import get_db
from backend.routers.auth import get_current_user
from backend.models.web_models import UserDB
from backend.services.trading_service import TradingService
from backend.schemas.schemas import (
    TradeRequest, OrderRequest, MessageResponse, OrderResponse,
    TradeRecordResponse, PortfolioPositionResponse, PerformanceResponse,
    EquityCurveResponse, AccountResponse, StockCreateRequest, StockResponse,
)

router = APIRouter(prefix="/api", tags=["trading"])


def get_trading_service(
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TradingService:
    return TradingService(db, current_user.id)


@router.get("/account", response_model=AccountResponse)
def get_account(svc: TradingService = Depends(get_trading_service)):
    return svc.get_account()


@router.get("/stocks", response_model=list[StockResponse])
def get_stocks(svc: TradingService = Depends(get_trading_service)):
    stocks = svc.get_stock_list()
    return [{"id": s.id, "code": s.code, "name": s.name, "exchange": s.exchange, "created_at": s.created_at} for s in stocks]


@router.post("/stocks", response_model=StockResponse)
def add_stock(data: StockCreateRequest, svc: TradingService = Depends(get_trading_service)):
    stock = svc.add_stock(data.code, data.name, data.exchange)
    return {"id": stock.id, "code": stock.code, "name": stock.name, "exchange": stock.exchange, "created_at": stock.created_at}


@router.post("/trade/buy", response_model=MessageResponse)
def buy_stock(data: TradeRequest, svc: TradingService = Depends(get_trading_service)):
    success, message = svc.buy_stock(data.stock_code, data.shares, data.price)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"success": True, "message": message}


@router.post("/trade/sell", response_model=MessageResponse)
def sell_stock(data: TradeRequest, svc: TradingService = Depends(get_trading_service)):
    success, message = svc.sell_stock(data.stock_code, data.shares, data.price)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"success": True, "message": message}


@router.post("/orders", response_model=MessageResponse)
def place_order(data: OrderRequest, svc: TradingService = Depends(get_trading_service)):
    success, message, order_id = svc.place_order(
        data.stock_code, data.order_type, data.side,
        data.shares, data.price, data.trigger_price,
    )
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"success": True, "message": message}


@router.delete("/orders/{order_id}", response_model=MessageResponse)
def cancel_order(order_id: int, svc: TradingService = Depends(get_trading_service)):
    success, message = svc.cancel_order(order_id)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"success": True, "message": message}


@router.get("/orders", response_model=list[OrderResponse])
def get_orders(status: Optional[str] = None, svc: TradingService = Depends(get_trading_service)):
    return svc.get_orders(status)


@router.get("/portfolio", response_model=list[PortfolioPositionResponse])
def get_portfolio(svc: TradingService = Depends(get_trading_service)):
    return svc.get_portfolio()


@router.get("/trades/history", response_model=list[TradeRecordResponse])
def get_trade_history(svc: TradingService = Depends(get_trading_service)):
    return svc.get_trade_history()


@router.get("/portfolio/performance", response_model=PerformanceResponse)
def get_performance(svc: TradingService = Depends(get_trading_service)):
    return svc.get_performance()


@router.get("/portfolio/equity", response_model=EquityCurveResponse)
def get_equity_curve(svc: TradingService = Depends(get_trading_service)):
    return svc.get_equity_curve()

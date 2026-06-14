from fastapi import APIRouter, HTTPException
from typing import List, Optional

from backend.services.analysis_service import analyze_spectral
from backend.services.backtest_service import run_backtest, list_strategies
from backend.services.stock_service import get_stock_prices, get_kline_data, get_stock_universe
from backend.schemas.schemas import (
    SpectralRequest, SpectralResponse,
    BacktestRequest, BacktestResponse,
    StockPriceResponse,
)

router = APIRouter(prefix="/api", tags=["analysis"])


@router.post("/analysis/spectral", response_model=SpectralResponse)
def spectral_analysis(data: SpectralRequest):
    return analyze_spectral(data.prices)


@router.post("/backtest", response_model=BacktestResponse)
def backtest(data: BacktestRequest):
    result = run_backtest(
        strategy_name=data.strategy,
        start_date=data.start_date,
        end_date=data.end_date,
        stock_codes=data.stock_codes,
        initial_cash=data.initial_cash,
        fee_rate=data.fee_rate,
        min_fee=data.min_fee,
        slippage_per_share=data.slippage_per_share,
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.get("/backtest/strategies")
def get_strategies():
    return {"strategies": list_strategies()}


@router.get("/market/prices", response_model=List[StockPriceResponse])
def market_prices(codes: Optional[str] = None):
    code_list = codes.split(",") if codes else None
    return get_stock_prices(code_list)


@router.get("/market/kline/{code}")
def kline_data(code: str, days: int = 60):
    data = get_kline_data(code, days)
    if data is None:
        raise HTTPException(status_code=404, detail=f"No data for {code}")
    return data


@router.get("/market/universe")
def stock_universe():
    return {"stocks": get_stock_universe()}


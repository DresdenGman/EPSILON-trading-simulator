from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    exp: int


class UserCreate(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AccountResponse(BaseModel):
    id: int
    cash: float
    initial_capital: float
    total_value: float = 0.0
    total_pnl: float = 0.0


class TradeRequest(BaseModel):
    stock_code: str = Field(..., min_length=1, max_length=20)
    shares: int = Field(..., gt=0)
    price: float = Field(..., gt=0)


class OrderRequest(BaseModel):
    stock_code: str = Field(..., min_length=1, max_length=20)
    order_type: str = Field(..., pattern="^(market|limit|stop_loss|take_profit)$")
    side: str = Field(..., pattern="^(buy|sell)$")
    shares: int = Field(..., gt=0)
    price: Optional[float] = Field(None, gt=0)
    trigger_price: Optional[float] = Field(None, gt=0)


class TradeRecordResponse(BaseModel):
    id: int
    stock_code: str
    trade_type: str
    shares: int
    price: float
    total_amount: float
    fee: float
    trade_date: date
    created_at: datetime

    model_config = {"from_attributes": True}


class PortfolioPositionResponse(BaseModel):
    stock_code: str
    shares: int
    avg_cost: float
    current_price: float
    market_value: float
    unrealized_pnl: float


class OrderResponse(BaseModel):
    id: int
    stock_code: str
    order_type: str
    side: str
    shares: int
    price: Optional[float] = None
    trigger_price: Optional[float] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PerformanceResponse(BaseModel):
    total_value: float
    cash: float
    total_return: float
    win_rate: float
    profit_factor: float
    max_drawdown: float
    unrealized_pnl: float


class EquityCurveResponse(BaseModel):
    dates: list
    equity: list
    initial_capital: float


class SpectralRequest(BaseModel):
    prices: List[float] = Field(..., min_length=2)


class SpectralResponse(BaseModel):
    frequencies: List[float]
    powers: List[float]
    dominant_period: float
    significant_periods: List[float]
    weekly_power: float
    monthly_power: float
    quarterly_power: float


class BacktestRequest(BaseModel):
    strategy: str = Field(default="moving_average", description="Strategy name")
    start_date: str = Field(..., description="YYYY-MM-DD")
    end_date: str = Field(..., description="YYYY-MM-DD")
    stock_codes: Optional[List[str]] = None
    initial_cash: float = Field(default=100000.0, gt=0)
    fee_rate: float = Field(default=0.0001, ge=0)
    min_fee: float = Field(default=1.0, ge=0)
    slippage_per_share: float = Field(default=0.0, ge=0)


class BacktestTradeResponse(BaseModel):
    date: str
    stock_code: str
    stock_name: str
    trade_type: str
    shares: int
    price: float
    total_amount: float


class BacktestPerformanceResponse(BaseModel):
    total_return: float
    cagr: float
    sharpe: float
    max_drawdown: float
    win_rate: float
    profit_factor: float


class BacktestEquityPoint(BaseModel):
    date: str
    equity: float


class BacktestResponse(BaseModel):
    strategy_name: str
    performance: BacktestPerformanceResponse
    trades: List[BacktestTradeResponse]
    equity_curve: List[BacktestEquityPoint]


class StockCreateRequest(BaseModel):
    code: str
    name: str
    exchange: str = "US"


class StockResponse(BaseModel):
    id: int
    code: str
    name: str
    exchange: str
    created_at: datetime

    model_config = {"from_attributes": True}


class StockPriceResponse(BaseModel):
    code: str
    name: str
    price: float
    change_percent: float


class MessageResponse(BaseModel):
    success: bool
    message: str


class StressTestConfigRequest(BaseModel):
    enabled: bool = False
    jump_probability: float = 0.02
    jump_sizes: Optional[List[float]] = None
    jump_direction: str = "down"
    extreme_probability: float = 0.01
    extreme_threshold: float = -0.15


class StressTestResponse(BaseModel):
    scenario_name: str
    returns: List[float]
    max_drawdown: float
    final_value: float
    total_return: float

"""
Trading service — buy/sell, orders, portfolio management.
All operations scoped to user_id.
"""
from datetime import date
from typing import Optional, Dict, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, func, case

from backend.models.web_models import (
    UserDB, StockDB, TradeRecordDB, OrderDB,
)
from backend.config import INITIAL_CAPITAL


class TradingService:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    def _get_user(self) -> Optional[UserDB]:
        return self.db.execute(
            select(UserDB).where(UserDB.id == self.user_id)
        ).scalars().first()

    def _get_or_create_stock(self, code: str, name: str = "", exchange: str = "US") -> StockDB:
        stock = self.db.execute(
            select(StockDB).where(
                StockDB.user_id == self.user_id,
                StockDB.code == code,
            )
        ).scalars().first()
        if not stock:
            stock = StockDB(user_id=self.user_id, code=code, name=name or code, exchange=exchange)
            self.db.add(stock)
            self.db.commit()
            self.db.refresh(stock)
        return stock

    def get_stock_list(self) -> list:
        stocks = self.db.execute(
            select(StockDB).where(StockDB.user_id == self.user_id)
        ).scalars().all()
        return stocks

    def add_stock(self, code: str, name: str, exchange: str = "US"):
        return self._get_or_create_stock(code, name, exchange)

    def get_account(self) -> dict:
        user = self._get_user()
        if not user:
            return {"cash": INITIAL_CAPITAL, "initial_capital": INITIAL_CAPITAL, "total_value": INITIAL_CAPITAL, "total_pnl": 0.0}

        total_value = self._calc_total_value(user)
        return {
            "id": user.id,
            "cash": user.cash,
            "initial_capital": user.initial_capital,
            "total_value": total_value,
            "total_pnl": total_value - user.initial_capital,
        }

    def buy_stock(self, stock_code: str, shares: int, price: float,
                  fee_rate: float = 0.001, min_fee: float = 1.0,
                  slippage_per_share: float = 0.01) -> Tuple[bool, str]:
        user = self._get_user()
        if not user:
            return False, "User not found"

        stock = self._get_or_create_stock(stock_code)

        effective_price = price + slippage_per_share
        total_amount = shares * effective_price
        fee = max(total_amount * fee_rate, min_fee)
        total_cost = total_amount + fee

        if user.cash < total_cost:
            return False, f"Insufficient cash. Need ${total_cost:,.2f}, have ${user.cash:,.2f}"

        trade = TradeRecordDB(
            user_id=self.user_id,
            stock_id=stock.id,
            trade_date=date.today(),
            trade_type="buy",
            shares=shares,
            price=effective_price,
            total_amount=total_amount,
            fee=fee,
        )
        self.db.add(trade)
        user.cash -= total_cost
        self.db.commit()
        return True, f"Bought {shares} shares of {stock_code} at ${effective_price:.2f}"

    def sell_stock(self, stock_code: str, shares: int, price: float,
                   fee_rate: float = 0.001, min_fee: float = 1.0,
                   slippage_per_share: float = 0.01) -> Tuple[bool, str]:
        user = self._get_user()
        if not user:
            return False, "User not found"

        stock = self._get_or_create_stock(stock_code)

        current_shares = self._get_position_shares(stock.id)
        if current_shares < shares:
            return False, f"Insufficient position. Have {current_shares} shares, trying to sell {shares}"

        effective_price = max(0.01, price - slippage_per_share)
        total_amount = shares * effective_price
        fee = max(total_amount * fee_rate, min_fee)
        net_proceeds = total_amount - fee

        trade = TradeRecordDB(
            user_id=self.user_id,
            stock_id=stock.id,
            trade_date=date.today(),
            trade_type="sell",
            shares=shares,
            price=effective_price,
            total_amount=total_amount,
            fee=fee,
        )
        self.db.add(trade)
        user.cash += net_proceeds
        self.db.commit()
        return True, f"Sold {shares} shares of {stock_code} at ${effective_price:.2f}"

    def _get_position_shares(self, stock_id: int) -> int:
        result = self.db.execute(
            select(
                func.coalesce(
                    func.sum(
                        case(
                            (TradeRecordDB.trade_type == "buy", TradeRecordDB.shares),
                            else_=-TradeRecordDB.shares,
                        )
                    ), 0
                )
            ).where(
                TradeRecordDB.user_id == self.user_id,
                TradeRecordDB.stock_id == stock_id,
            )
        ).scalar()
        return int(result) if result else 0

    def place_order(self, stock_code: str, order_type: str, side: str,
                    shares: int, price: Optional[float] = None,
                    trigger_price: Optional[float] = None) -> Tuple[bool, str, Optional[int]]:
        user = self._get_user()
        if not user:
            return False, "User not found", None

        stock = self._get_or_create_stock(stock_code)

        order = OrderDB(
            user_id=self.user_id,
            stock_id=stock.id,
            order_type=order_type,
            side=side,
            shares=shares,
            price=price,
            trigger_price=trigger_price,
            status="pending",
        )
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return True, f"Order placed, ID: {order.id}", order.id

    def cancel_order(self, order_id: int) -> Tuple[bool, str]:
        order = self.db.execute(
            select(OrderDB).where(
                OrderDB.id == order_id,
                OrderDB.user_id == self.user_id,
            )
        ).scalars().first()
        if not order:
            return False, f"Order {order_id} not found"
        if order.status != "pending":
            return False, f"Order {order_id} is {order.status}, cannot cancel"

        order.status = "cancelled"
        self.db.commit()
        return True, f"Order {order_id} cancelled"

    def get_portfolio(self) -> list:
        summaries = self.db.execute(
            select(
                TradeRecordDB.stock_id,
                func.coalesce(
                    func.sum(
                        case(
                            (TradeRecordDB.trade_type == "buy", TradeRecordDB.shares),
                            else_=-TradeRecordDB.shares,
                        )
                    ), 0
                ).label("total_shares"),
                func.coalesce(
                    func.sum(
                        case(
                            (TradeRecordDB.trade_type == "buy",
                             TradeRecordDB.total_amount + TradeRecordDB.fee),
                            else_=0,
                        )
                    ) / func.nullif(
                        func.sum(
                            case(
                                (TradeRecordDB.trade_type == "buy", TradeRecordDB.shares),
                                else_=0,
                            )
                        ), 0
                    ), 0.0
                ).label("avg_cost"),
            ).where(TradeRecordDB.user_id == self.user_id)
            .group_by(TradeRecordDB.stock_id)
        ).all()

        positions = []
        for stock_id, shares, avg_cost in summaries:
            if shares <= 0:
                continue
            stock = self.db.execute(select(StockDB).where(StockDB.id == stock_id)).scalars().first()
            if not stock:
                continue
            current_price = avg_cost
            market_value = shares * current_price
            unrealized_pnl = (current_price - avg_cost) * shares
            positions.append({
                "stock_code": stock.code,
                "shares": int(shares),
                "avg_cost": float(avg_cost),
                "current_price": float(current_price),
                "market_value": float(market_value),
                "unrealized_pnl": float(unrealized_pnl),
            })
        return positions

    def get_trade_history(self, start_date: Optional[date] = None,
                          end_date: Optional[date] = None) -> list:
        stmt = select(TradeRecordDB).where(TradeRecordDB.user_id == self.user_id)
        if start_date:
            stmt = stmt.where(TradeRecordDB.trade_date >= start_date)
        if end_date:
            stmt = stmt.where(TradeRecordDB.trade_date <= end_date)
        stmt = stmt.order_by(TradeRecordDB.trade_date.desc())

        trades = self.db.execute(stmt).scalars().all()
        return [
            {
                "id": t.id,
                "stock_code": t.stock.code if t.stock else "",
                "trade_type": t.trade_type,
                "shares": t.shares,
                "price": t.price,
                "total_amount": t.total_amount,
                "fee": t.fee,
                "trade_date": t.trade_date.strftime("%Y-%m-%d") if t.trade_date else "",
                "created_at": t.created_at,
            }
            for t in trades
        ]

    def get_orders(self, status: Optional[str] = None) -> list:
        stmt = select(OrderDB).where(OrderDB.user_id == self.user_id)
        if status:
            stmt = stmt.where(OrderDB.status == status)
        stmt = stmt.order_by(OrderDB.created_at.desc())
        orders = self.db.execute(stmt).scalars().all()
        return [
            {
                "id": o.id,
                "stock_code": o.stock.code if o.stock else "",
                "order_type": o.order_type,
                "side": o.side,
                "shares": o.shares,
                "price": o.price,
                "trigger_price": o.trigger_price,
                "status": o.status,
                "created_at": o.created_at,
            }
            for o in orders
        ]

    def _calc_total_value(self, user: UserDB) -> float:
        total = user.cash
        for pos in self.get_portfolio():
            total += pos["market_value"]
        return total

    def get_performance(self) -> dict:
        user = self._get_user()
        if not user:
            return {"total_value": 0, "cash": 0, "total_return": 0, "win_rate": 0,
                    "profit_factor": 0, "max_drawdown": 0, "unrealized_pnl": 0}

        total_value = self._calc_total_value(user)
        total_return = ((total_value - user.initial_capital) / user.initial_capital) * 100

        trades = self.get_trade_history()
        positions = self.get_portfolio()

        win_rate = 0.0
        profit_factor = 0.0
        max_drawdown = 0.0
        unrealized_pnl = sum(p["unrealized_pnl"] for p in positions)

        if trades:
            profitable = sum(1 for t in trades if t["total_amount"] > t["fee"])
            win_rate = (profitable / len(trades)) * 100 if trades else 0.0

            gross_profit = sum(t["total_amount"] - t["fee"] for t in trades if t["total_amount"] > t["fee"])
            gross_loss = sum(abs(t["total_amount"] - t["fee"]) for t in trades if t["total_amount"] < t["fee"])
            profit_factor = gross_profit / gross_loss if gross_loss > 0 else float("inf")

        return {
            "total_value": total_value,
            "cash": user.cash,
            "total_return": round(total_return, 2),
            "win_rate": round(win_rate, 2),
            "profit_factor": round(min(profit_factor, 999.99), 2),
            "max_drawdown": round(max_drawdown, 2),
            "unrealized_pnl": round(unrealized_pnl, 2),
        }

    def get_equity_curve(self) -> dict:
        user = self._get_user()
        if not user:
            return {"dates": [], "equity": [], "initial_capital": INITIAL_CAPITAL}

        trades = self.db.execute(
            select(TradeRecordDB).where(TradeRecordDB.user_id == self.user_id)
            .order_by(TradeRecordDB.trade_date.asc())
        ).scalars().all()

        equity = user.initial_capital
        dates_list = [str(date.today())]
        equity_list = [equity]

        for t in trades:
            if t.trade_type == "buy":
                equity -= t.total_amount + t.fee
            else:
                equity += t.total_amount - t.fee
            dates_list.append(str(t.trade_date))
            equity_list.append(equity)

        return {
            "dates": dates_list,
            "equity": equity_list,
            "initial_capital": user.initial_capital,
        }

import json
import os
from typing import Any, Dict, List, Tuple


class TradeManager:
    """Trading and portfolio management, extracted from mock.py for reuse."""

    def __init__(self, initial_cash: float = 100000.0) -> None:
        # Get the directory of the current file
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.data_file = os.path.join(self.base_dir, "trade_data.json")
        self.trade_records: List[Dict[str, Any]] = []
        self.pending_orders: List[Dict[str, Any]] = []
        # Allow customizable starting cash; this may be overridden by saved data in load_data().
        self.initial_cash: float = float(initial_cash)
        self.cash: float = float(initial_cash)
        self.portfolio: Dict[str, Dict[str, float]] = {}

        # Trading cost settings（默认值：万分之一手续费、1 美元最低、无滑点）
        self.fee_rate: float = 0.0001  # 比例手续费（相对于成交金额）
        self.min_fee: float = 1.0  # 每笔最低手续费
        self.slippage_per_share: float = 0.0  # 每股滑点（价格偏移）

        # Risk & auto-trading settings
        self.stop_loss_pct: float = 0.0  # 单只股票止损线（亏损百分比，例如 10 表示 -10% 自动卖出）
        self.scale_step_pct: float = 0.0  # 分批加减仓触发阈值（盈利/亏损百分比）
        self.scale_fraction_pct: float = 0.0  # 触发时加减仓比例（占当前持仓的百分比）

        self.load_data()

    def load_data(self) -> None:
        """Load trade data from file."""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.trade_records = data.get("trade_records", [])
                    self.cash = data.get("cash", self.cash)
                    self.initial_cash = data.get("initial_cash", self.initial_cash)
                    self.portfolio = data.get("portfolio", {})
                    self.pending_orders = data.get("pending_orders", [])

                    # 加载交易成本设置（若旧文件中没有，则保持默认）
                    self.fee_rate = data.get("fee_rate", self.fee_rate)
                    self.min_fee = data.get("min_fee", self.min_fee)
                    self.slippage_per_share = data.get("slippage_per_share", self.slippage_per_share)
                    # 加载风险与自动交易设置
                    self.stop_loss_pct = data.get("stop_loss_pct", self.stop_loss_pct)
                    self.scale_step_pct = data.get("scale_step_pct", self.scale_step_pct)
                    self.scale_fraction_pct = data.get("scale_fraction_pct", self.scale_fraction_pct)
            except Exception as e:
                print(f"Failed to load data: {str(e)}")
                self.trade_records = []
                self.cash = 100000.0
                self.portfolio = {}

    def save_data(self) -> None:
        """Save trade data to file."""
        try:
            data = {
                "trade_records": self.trade_records,
                "cash": self.cash,
                "initial_cash": self.initial_cash,
                "portfolio": self.portfolio,
                "pending_orders": self.pending_orders,
                "fee_rate": self.fee_rate,
                "min_fee": self.min_fee,
                "slippage_per_share": self.slippage_per_share,
                "stop_loss_pct": self.stop_loss_pct,
                "scale_step_pct": self.scale_step_pct,
                "scale_fraction_pct": self.scale_fraction_pct,
            }
            with open(self.data_file, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Failed to save data: {str(e)}")

    def add_trade_record(
        self,
        date: str,
        stock_code: str,
        stock_name: str,
        trade_type: str,
        shares: int,
        price: float,
        total_amount: float,
    ) -> None:
        """Add trade record."""
        record = {
            "date": date,
            "stock_code": stock_code,
            "stock_name": stock_name,
            "trade_type": trade_type,
            "shares": shares,
            "price": price,
            "total_amount": total_amount,
        }
        self.trade_records.append(record)
        self.save_data()

    def update_portfolio(self, stock_code: str, shares: int, price: float, trade_type: str) -> None:
        """Update portfolio information."""
        if trade_type == "Buy":
            if stock_code in self.portfolio:
                self.portfolio[stock_code]["shares"] += shares
                self.portfolio[stock_code]["total_cost"] += shares * price
            else:
                self.portfolio[stock_code] = {
                    "shares": shares,
                    "total_cost": shares * price,
                }
        else:  # Sell
            if stock_code in self.portfolio:
                self.portfolio[stock_code]["shares"] -= shares
                self.portfolio[stock_code]["total_cost"] -= shares * price
                if self.portfolio[stock_code]["shares"] == 0:
                    del self.portfolio[stock_code]

    def get_trade_records(self) -> List[Dict[str, Any]]:
        """Get all trade records."""
        return self.trade_records

    def get_portfolio(self) -> Dict[str, Dict[str, float]]:
        """Get current portfolio."""
        return self.portfolio

    def get_pending_orders(self) -> List[Dict[str, Any]]:
        """Get current pending orders."""
        return self.pending_orders

    def add_pending_order(self, order: Dict[str, Any]) -> None:
        """Add a pending order."""
        self.pending_orders.append(order)
        self.save_data()

    def remove_pending_order(self, order_id: Any) -> None:
        """Remove pending order by id."""
        self.pending_orders = [o for o in self.pending_orders if o.get("id") != order_id]
        self.save_data()

    def get_cash(self) -> float:
        """Get current cash."""
        return self.cash

    def update_cash(self, amount: float, trade_type: str, fee: float = 0.0) -> None:
        """Update cash.

        amount: 成交金额（价格 × 股数），不含手续费
        fee: 手续费（正数）
        """
        if trade_type == "Buy":
            self.cash -= amount + fee
        else:  # Sell
            self.cash += amount - fee
        self.save_data()

    def calculate_trade_costs(self, price: float, shares: int, trade_type: str) -> Tuple[float, float, float]:
        """根据当前交易成本设置，计算实际成交价、成交金额和手续费。

        返回: execution_price, gross_amount, fee
        """
        # 滑点：买入价格向上偏移，卖出价格向下偏移
        if trade_type == "Buy":
            exec_price = price + self.slippage_per_share
        else:
            exec_price = max(0.01, price - self.slippage_per_share)

        gross = exec_price * shares
        fee = max(self.min_fee, abs(gross) * self.fee_rate) if gross > 0 else 0.0
        return exec_price, gross, fee



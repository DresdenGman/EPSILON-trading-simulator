"""Helper utilities for future refactors.

This file previously contained helpers for migrating from the monolithic
`mock.py` to a fully modular structure. The original implementation was
lost, so this is a light-weight placeholder we can extend as needed.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List


@dataclass
class ModuleRefactorPlan:
    """Describe a planned refactor from old paths to new ones."""

    source: str
    target: str
    notes: str = ""


def default_refactor_plan() -> List[ModuleRefactorPlan]:
    """Return a high-level view of the desired module structure.

    This is mainly documentation in code form and not used at runtime.
    """

    return [
        ModuleRefactorPlan("mock.StockDataManager", "data.stock_data_manager.StockDataManager"),
        ModuleRefactorPlan("mock.TradeManager", "trading.trade_manager.TradeManager"),
        ModuleRefactorPlan("mock.StockTradeSimulator", "ui.simulator_gui.StockTradeSimulator"),
    ]




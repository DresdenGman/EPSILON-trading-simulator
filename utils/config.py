"""Configuration dataclasses for EPSILON / stock trading simulator.

This is a simplified reconstruction based on the previous project notes.
It is intentionally minimal for now and can be extended as we wire more
settings into the UI and trading engine.
"""

from dataclasses import dataclass


@dataclass
class UIConfig:
    primary_color: str = "#FFFFFF"
    secondary_color: str = "#F5F7FB"
    accent_color: str = "#2563EB"
    success_color: str = "#16A34A"
    danger_color: str = "#DC2626"
    text_color: str = "#111827"
    border_color: str = "#E5E7EB"
    header_bg: str = "#EFF3FB"
    hover_color: str = "#E0ECFF"


@dataclass
class TradingConfig:
    default_initial_cash: float = 100000.0
    default_fee_rate: float = 0.0001
    default_min_fee: float = 1.0
    default_slippage_per_share: float = 0.0


@dataclass
class AppConfig:
    """Top-level config object holding UI and trading defaults."""

    ui: UIConfig = UIConfig()
    trading: TradingConfig = TradingConfig()


_config = AppConfig()


def get_config() -> AppConfig:
    """Return the singleton configuration instance."""
    return _config




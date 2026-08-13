"""
Analysis service — spectral analysis, AI chat, and stress testing.
Wraps existing analysis modules.
"""
import sys
import os
import numpy as np
from typing import List, Dict, Optional, Tuple

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from src.core.spectral_analysis import compute_fft, analyze_price_spectrum, get_period_analysis


def analyze_spectral(prices: List[float]) -> dict:
    arr = np.array(prices, dtype=float)
    arr = arr[~np.isnan(arr)]
    if len(arr) < 2:
        return {
            "frequencies": [], "powers": [],
            "dominant_period": 0, "significant_periods": [],
            "weekly_power": 0, "monthly_power": 0, "quarterly_power": 0,
        }

    result = analyze_price_spectrum(arr)
    period_analysis = get_period_analysis(arr)

    return {
        "frequencies": result.frequencies.tolist() if len(result.frequencies) > 0 else [],
        "powers": result.powers.tolist() if len(result.powers) > 0 else [],
        "dominant_period": float(result.dominant_period),
        "significant_periods": [float(p) for p in result.significant_periods],
        "weekly_power": float(period_analysis["weekly_power"]),
        "monthly_power": float(period_analysis["monthly_power"]),
        "quarterly_power": float(period_analysis["quarterly_power"]),
    }

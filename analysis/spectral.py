"""Spectral analysis module for stock price time series.

This module provides FFT-based frequency domain analysis to identify
dominant trading cycles in price data.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import datetime


def compute_fft(prices: pd.Series, sampling_rate: float = 1.0) -> Tuple[np.ndarray, np.ndarray]:
    """Compute FFT of price series.
    
    Args:
        prices: Price series (pandas Series with numeric values)
        sampling_rate: Samples per day (default: 1.0 for daily data)
    
    Returns:
        Tuple of (frequencies, power_spectrum)
        - frequencies: Array of frequencies (cycles per day)
        - power_spectrum: Array of power values (magnitude squared)
    """
    if len(prices) < 2:
        return np.array([]), np.array([])
    
    # Remove NaN values
    clean_prices = prices.dropna()
    if len(clean_prices) < 2:
        return np.array([]), np.array([])
    
    # Detrend: subtract mean to remove DC component
    detrended = clean_prices - clean_prices.mean()
    
    # Apply window function (Hanning window) to reduce spectral leakage
    window = np.hanning(len(detrended))
    windowed = detrended * window
    
    # Compute FFT
    fft_result = np.fft.fft(windowed)
    n = len(fft_result)
    
    # Compute power spectrum (magnitude squared)
    power_spectrum = np.abs(fft_result) ** 2
    
    # Compute frequencies (only positive frequencies, up to Nyquist)
    frequencies = np.fft.fftfreq(n, d=1.0/sampling_rate)
    
    # Take only positive frequencies
    positive_freq_idx = frequencies >= 0
    frequencies = frequencies[positive_freq_idx]
    power_spectrum = power_spectrum[positive_freq_idx]
    
    return frequencies, power_spectrum


def identify_dominant_cycles(
    frequencies: np.ndarray,
    power_spectrum: np.ndarray,
    min_period_days: float = 2.0,
    max_period_days: float = 365.0,
    top_n: int = 5
) -> List[Tuple[float, float, float]]:
    """Identify dominant cycles from FFT results.
    
    Args:
        frequencies: Array of frequencies (cycles per day)
        power_spectrum: Array of power values
        min_period_days: Minimum period to consider (days)
        max_period_days: Maximum period to consider (days)
        top_n: Number of top cycles to return
    
    Returns:
        List of (period_days, frequency, power) tuples, sorted by power (descending)
    """
    if len(frequencies) == 0 or len(power_spectrum) == 0:
        return []
    
    # Convert frequencies to periods (days)
    # Avoid division by zero
    non_zero_freq = frequencies > 0
    periods = np.zeros_like(frequencies)
    periods[non_zero_freq] = 1.0 / frequencies[non_zero_freq]
    
    # Filter by period range
    valid_periods = (periods >= min_period_days) & (periods <= max_period_days)
    
    if not np.any(valid_periods):
        return []
    
    # Get valid data
    valid_periods_array = periods[valid_periods]
    valid_frequencies = frequencies[valid_periods]
    valid_power = power_spectrum[valid_periods]
    
    # Find top N peaks
    # Sort by power (descending)
    sorted_indices = np.argsort(valid_power)[::-1]
    
    # Take top N, but avoid duplicates (cycles that are very close)
    cycles = []
    seen_periods = set()
    min_period_diff = 0.1  # Minimum difference in days to consider distinct
    
    for idx in sorted_indices[:top_n * 2]:  # Check more candidates to filter duplicates
        period = valid_periods_array[idx]
        freq = valid_frequencies[idx]
        power = valid_power[idx]
        
        # Check if this period is too close to an already selected one
        is_duplicate = False
        for seen_period in seen_periods:
            if abs(period - seen_period) < min_period_diff:
                is_duplicate = True
                break
        
        if not is_duplicate:
            cycles.append((period, freq, power))
            seen_periods.add(period)
        
        if len(cycles) >= top_n:
            break
    
    return cycles


def analyze_stock_spectrum(
    price_data: pd.DataFrame,
    price_column: str = 'close',
    min_period_days: float = 2.0,
    max_period_days: float = 365.0,
    top_n: int = 5
) -> Dict:
    """Analyze spectral properties of a stock's price series.
    
    Args:
        price_data: DataFrame with OHLC data, must have a date index or 'date' column
        price_column: Column name for price data (default: 'close')
        min_period_days: Minimum period to consider (days)
        max_period_days: Maximum period to consider (days)
        top_n: Number of top cycles to identify
    
    Returns:
        Dictionary containing:
        - 'frequencies': Array of frequencies
        - 'power_spectrum': Array of power values
        - 'dominant_cycles': List of (period_days, frequency, power) tuples
        - 'total_power': Total power in the spectrum
        - 'dominant_period': Most dominant period (days)
    """
    # Extract price series
    if price_column not in price_data.columns:
        raise ValueError(f"Column '{price_column}' not found in price_data")
    
    prices = price_data[price_column].copy()
    
    # Ensure prices are sorted by date
    if isinstance(prices.index, pd.DatetimeIndex):
        prices = prices.sort_index()
    elif 'date' in price_data.columns:
        price_data = price_data.sort_values('date')
        prices = price_data[price_column].copy()
    
    # Compute FFT
    frequencies, power_spectrum = compute_fft(prices)
    
    if len(frequencies) == 0:
        return {
            'frequencies': np.array([]),
            'power_spectrum': np.array([]),
            'dominant_cycles': [],
            'total_power': 0.0,
            'dominant_period': None
        }
    
    # Identify dominant cycles
    dominant_cycles = identify_dominant_cycles(
        frequencies, power_spectrum,
        min_period_days=min_period_days,
        max_period_days=max_period_days,
        top_n=top_n
    )
    
    # Compute total power
    total_power = np.sum(power_spectrum)
    
    # Get most dominant period
    dominant_period = dominant_cycles[0][0] if dominant_cycles else None
    
    return {
        'frequencies': frequencies,
        'power_spectrum': power_spectrum,
        'dominant_cycles': dominant_cycles,
        'total_power': total_power,
        'dominant_period': dominant_period
    }


def format_period_description(period_days: float) -> str:
    """Format period in days as human-readable description.
    
    Args:
        period_days: Period in days
    
    Returns:
        Formatted string like "30天周期" or "2.5周周期"
    """
    if period_days < 7:
        return f"{period_days:.1f}天周期"
    elif period_days < 30:
        weeks = period_days / 7
        return f"{weeks:.1f}周周期"
    elif period_days < 365:
        months = period_days / 30
        return f"{months:.1f}月周期"
    else:
        years = period_days / 365
        return f"{years:.1f}年周期"

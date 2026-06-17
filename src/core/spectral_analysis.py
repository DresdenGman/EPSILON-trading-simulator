"""
Spectral Analysis Module - FFT-based cycle detection
"""
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass


@dataclass
class SpectrumResult:
    """Result of spectral analysis"""
    frequencies: np.ndarray
    powers: np.ndarray
    dominant_period: float
    secondary_period: Optional[float] = None
    significant_periods: List[float] = None
    
    def __post_init__(self):
        if self.significant_periods is None:
            self.significant_periods = []


def compute_fft(prices: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    Compute Fast Fourier Transform of price series
    
    Args:
        prices: Array of prices
        
    Returns:
        Tuple of (frequencies, powers)
    """
    # Remove NaN values
    prices = prices[~np.isnan(prices)]
    
    if len(prices) < 2:
        return np.array([]), np.array([])
    
    # Detrend the data (subtract mean)
    detrended = prices - np.mean(prices)
    
    # Apply FFT
    fft_result = np.fft.fft(detrended)
    
    # Compute power spectrum (magnitude squared)
    power_spectrum = np.abs(fft_result) ** 2
    
    # Get frequencies (cycles per sample)
    n = len(prices)
    frequencies = np.fft.fftfreq(n)
    
    # Only keep positive frequencies (exclude zero and negative)
    positive_freq = frequencies[1:n//2]
    positive_power = power_spectrum[1:n//2]
    
    return positive_freq, positive_power


def analyze_price_spectrum(prices: np.ndarray, sample_rate: float = 1.0) -> SpectrumResult:
    """
    Analyze price series using spectral analysis
    
    Args:
        prices: Array of prices
        sample_rate: Sampling rate (e.g., 1.0 for daily data)
        
    Returns:
        SpectrumResult with analysis
    """
    freqs, powers = compute_fft(prices)
    
    if len(freqs) == 0:
        return SpectrumResult(
            frequencies=np.array([]),
            powers=np.array([]),
            dominant_period=0.0
        )
    
    # Find dominant frequency (highest power)
    if len(powers) > 0:
        dominant_idx = np.argmax(powers)
        dominant_freq = freqs[dominant_idx]
        
        # Convert frequency to period (in samples)
        if dominant_freq > 0:
            dominant_period = 1.0 / (dominant_freq * sample_rate)
        else:
            dominant_period = 0.0
    else:
        dominant_period = 0.0
    
    # Find significant periods (peaks in spectrum)
    significant_periods = []
    
    # Simple peak detection: find local maxima
    if len(powers) > 2:
        for i in range(1, len(powers) - 1):
            if powers[i] > powers[i-1] and powers[i] > powers[i+1]:
                if powers[i] > np.mean(powers) * 1.5:  # Above average threshold
                    period = 1.0 / (freqs[i] * sample_rate)
                    if 2 <= period <= len(prices) / 2:  # Reasonable period range
                        significant_periods.append(period)
    
    # Sort by power (descending)
    if len(significant_periods) > 1:
        sorted_periods = []
        for period in significant_periods:
            idx = np.argmin(np.abs(freqs - 1.0 / period))
            sorted_periods.append((period, powers[idx]))
        sorted_periods.sort(key=lambda x: x[1], reverse=True)
        significant_periods = [p[0] for p in sorted_periods]
    
    return SpectrumResult(
        frequencies=freqs,
        powers=powers,
        dominant_period=dominant_period,
        significant_periods=significant_periods
    )


def get_period_analysis(prices: np.ndarray, sample_rate: float = 1.0) -> Dict[str, float]:
    """
    Get simplified period analysis for display
    
    Args:
        prices: Array of prices
        sample_rate: Sampling rate
        
    Returns:
        Dictionary with period analysis
    """
    result = analyze_price_spectrum(prices, sample_rate)
    
    # Default periods to check
    periods_to_check = [7.0, 30.0, 90.0]  # Weekly, monthly, quarterly
    period_powers = {}
    
    for period in periods_to_check:
        freq = 1.0 / (period * sample_rate)
        if len(result.frequencies) > 0:
            idx = np.argmin(np.abs(result.frequencies - freq))
            period_powers[period] = result.powers[idx] if idx < len(result.powers) else 0.0
    
    return {
        "dominant_period": result.dominant_period,
        "weekly_power": period_powers.get(7.0, 0.0),
        "monthly_power": period_powers.get(30.0, 0.0),
        "quarterly_power": period_powers.get(90.0, 0.0),
    }

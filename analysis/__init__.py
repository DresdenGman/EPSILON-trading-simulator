"""Performance analysis package (e.g. performance metrics helpers)."""

from .spectral import (
    compute_fft,
    identify_dominant_cycles,
    analyze_stock_spectrum,
    format_period_description
)

__all__ = [
    'compute_fft',
    'identify_dominant_cycles',
    'analyze_stock_spectrum',
    'format_period_description'
]


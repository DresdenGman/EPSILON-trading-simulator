"""Analysis package: performance metrics, spectral analysis, stress testing, and export/AI analysis."""

from .spectral import (
    compute_fft,
    identify_dominant_cycles,
    analyze_stock_spectrum,
    format_period_description
)

# Export analysis (optional, may not be available)
try:
    from .export_analysis import ExportAnalyzer
    EXPORT_ANALYSIS_AVAILABLE = True
except ImportError:
    ExportAnalyzer = None
    EXPORT_ANALYSIS_AVAILABLE = False

__all__ = [
    'compute_fft',
    'identify_dominant_cycles',
    'analyze_stock_spectrum',
    'format_period_description',
    'ExportAnalyzer',
    'EXPORT_ANALYSIS_AVAILABLE',
]


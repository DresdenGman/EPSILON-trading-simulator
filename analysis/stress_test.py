"""Stress testing module for generating extreme market scenarios.

This module implements jump diffusion models and extreme value distributions
to generate black swan events for strategy stress testing.
"""

import random
from typing import Dict, List, Optional, Tuple
import numpy as np
import math

# Try to import scipy for advanced distributions, but make it optional
try:
    from scipy.stats import genextreme, pareto
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False
    genextreme = None
    pareto = None

# Try to import machine learning libraries for quantile regression
try:
    from sklearn.ensemble import GradientBoostingRegressor
    from sklearn.linear_model import QuantileRegressor
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    GradientBoostingRegressor = None
    QuantileRegressor = None

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False
    pd = None


class StressTestConfig:
    """Configuration for stress testing parameters."""
    
    def __init__(
        self,
        enabled: bool = False,
        jump_probability: float = 0.02,  # 2% chance of jump
        jump_sizes: Optional[List[float]] = None,
        jump_direction: str = "down",  # "down", "up", or "both"
        extreme_probability: float = 0.01,  # 1% chance of extreme event
        extreme_threshold: float = -0.15,  # -15% threshold
        extreme_distribution: str = "gev",  # "gev", "pareto", or "simple"
        extreme_shape: float = -0.3,  # Shape parameter for GEV (negative = heavy tail)
        extreme_scale: float = 0.10,  # Scale parameter
        use_quantile_regression: bool = False,  # Stage 3: Use quantile regression
        quantile_level: float = 0.01,  # Quantile level for prediction (e.g., 0.01 for 1% tail)
    ):
        """Initialize stress test configuration.
        
        Args:
            enabled: Whether stress testing is enabled
            jump_probability: Probability of a jump event occurring (0.0 to 1.0)
            jump_sizes: List of possible jump sizes (as fractions, e.g., -0.20 for -20%)
            jump_direction: Direction of jumps ("down", "up", or "both")
            extreme_probability: Probability of extreme value event
            extreme_threshold: Threshold for extreme events (negative for crashes)
        """
        self.enabled = enabled
        self.jump_probability = max(0.0, min(1.0, jump_probability))
        self.jump_sizes = jump_sizes or [-0.20, -0.15, -0.10]  # Default: crashes
        self.jump_direction = jump_direction
        self.extreme_probability = max(0.0, min(1.0, extreme_probability))
        self.extreme_threshold = extreme_threshold
        self.extreme_distribution = extreme_distribution
        self.extreme_shape = extreme_shape
        self.extreme_scale = extreme_scale
        self.use_quantile_regression = use_quantile_regression
        self.quantile_level = quantile_level
    
    def to_dict(self) -> Dict:
        """Convert configuration to dictionary."""
        return {
            "enabled": self.enabled,
            "jump_probability": self.jump_probability,
            "jump_sizes": self.jump_sizes,
            "jump_direction": self.jump_direction,
            "extreme_probability": self.extreme_probability,
            "extreme_threshold": self.extreme_threshold,
            "extreme_distribution": self.extreme_distribution,
            "extreme_shape": self.extreme_shape,
            "extreme_scale": self.extreme_scale,
            "use_quantile_regression": self.use_quantile_regression,
            "quantile_level": self.quantile_level,
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> "StressTestConfig":
        """Create configuration from dictionary."""
        return cls(
            enabled=data.get("enabled", False),
            jump_probability=data.get("jump_probability", 0.02),
            jump_sizes=data.get("jump_sizes", [-0.20, -0.15, -0.10]),
            jump_direction=data.get("jump_direction", "down"),
            extreme_probability=data.get("extreme_probability", 0.01),
            extreme_threshold=data.get("extreme_threshold", -0.15),
            extreme_distribution=data.get("extreme_distribution", "gev"),
            extreme_shape=data.get("extreme_shape", -0.3),
            extreme_scale=data.get("extreme_scale", 0.10),
            use_quantile_regression=data.get("use_quantile_regression", False),
            quantile_level=data.get("quantile_level", 0.01),
        )


class JumpDiffusionModel:
    """Jump diffusion model for generating extreme price movements.
    
    This model adds random jumps to normal price movements, simulating
    black swan events like flash crashes or sudden market shocks.
    """
    
    def __init__(self, config: StressTestConfig):
        """Initialize jump diffusion model.
        
        Args:
            config: Stress test configuration
        """
        self.config = config
        # Initialize quantile regression model if enabled (Stage 3)
        self.quantile_model = None
        if config.use_quantile_regression:
            self.quantile_model = QuantileRegressionModel(
                quantile_levels=[config.quantile_level],
                lookback_days=30,
                use_ml=SKLEARN_AVAILABLE
            )
    
    def apply_jump(
        self,
        base_change_percent: float,
        seed: Optional[str] = None
    ) -> Tuple[float, bool]:
        """Apply jump diffusion to price change.
        
        Args:
            base_change_percent: Base price change percentage (from normal model)
            seed: Random seed for reproducibility
        
        Returns:
            Tuple of (adjusted_change_percent, jump_occurred)
        """
        if not self.config.enabled:
            return base_change_percent, False
        
        # Use seed for reproducibility
        if seed:
            rng = random.Random(seed)
        else:
            rng = random.Random()
        
        # Check if jump occurs
        if rng.random() >= self.config.jump_probability:
            return base_change_percent, False
        
        # Jump occurred - select jump size
        jump_size = rng.choice(self.config.jump_sizes)
        
        # Apply direction filter
        if self.config.jump_direction == "down" and jump_size > 0:
            jump_size = -abs(jump_size)  # Force negative
        elif self.config.jump_direction == "up" and jump_size < 0:
            jump_size = abs(jump_size)  # Force positive
        # "both" allows any direction
        
        # Apply jump to base change
        adjusted_change = base_change_percent + (jump_size * 100)  # Convert to percentage
        
        return adjusted_change, True
    
    def apply_extreme_value(
        self,
        base_change_percent: float,
        seed: Optional[str] = None
    ) -> Tuple[float, bool]:
        """Apply extreme value distribution (stage 2 feature).
        
        Uses statistical distributions (GEV or Pareto) to generate
        realistic tail risk scenarios.
        
        Args:
            base_change_percent: Base price change percentage
            seed: Random seed for reproducibility
        
        Returns:
            Tuple of (adjusted_change_percent, extreme_occurred)
        """
        if not self.config.enabled:
            return base_change_percent, False
        
        # Use seed for reproducibility
        if seed:
            rng = random.Random(seed)
            np_seed = hash(seed) % (2**32)  # Convert to numpy-compatible seed
        else:
            rng = random.Random()
            np_seed = None
        
        # Check if extreme event occurs
        if rng.random() >= self.config.extreme_probability:
            return base_change_percent, False
        
        # Extreme event occurred - generate using distribution or quantile regression
        # Stage 3: Try quantile regression first if enabled
        if self.config.use_quantile_regression and self.quantile_model is not None:
            # Use simple quantile prediction (full ML requires training data)
            extreme_change = self.quantile_model._predict_simple_quantile([], self.config.quantile_level)
            extreme_change_pct = extreme_change * 100
            return extreme_change_pct, True
        
        # Stage 2: Use statistical distributions
        if self.config.extreme_distribution == "gev" and SCIPY_AVAILABLE:
            # Use Generalized Extreme Value distribution
            # Negative shape parameter = heavy tail (Weibull type)
            extreme_change = self._generate_gev_extreme(np_seed)
        elif self.config.extreme_distribution == "pareto" and SCIPY_AVAILABLE:
            # Use Pareto distribution for tail risk
            extreme_change = self._generate_pareto_extreme(np_seed)
        else:
            # Fallback: use simple threshold or manual implementation
            extreme_change = self._generate_simple_extreme(rng)
        
        # Convert to percentage and ensure it's negative (crash)
        extreme_change_pct = extreme_change * 100
        
        return extreme_change_pct, True
    
    def _generate_gev_extreme(self, seed: Optional[int] = None) -> float:
        """Generate extreme value using GEV distribution.
        
        Uses scipy if available, otherwise manual implementation.
        """
        if SCIPY_AVAILABLE and genextreme:
            # Use scipy's GEV distribution
            if seed is not None:
                np.random.seed(seed)
            # GEV with negative shape = heavy tail (crashes)
            # loc (location) = mean, scale = std, c (shape) = tail heaviness
            # For crashes, we want negative returns
            extreme = genextreme.rvs(
                c=self.config.extreme_shape,  # Negative = heavy left tail
                loc=self.config.extreme_threshold,  # Center around threshold
                scale=self.config.extreme_scale,
                size=1
            )[0]
            # Ensure it's negative (crash)
            return min(extreme, -0.05)  # At least -5%
        else:
            # Manual GEV implementation (simplified)
            # Using inverse CDF approximation for GEV
            u = random.random()
            c = self.config.extreme_shape
            loc = self.config.extreme_threshold
            scale = self.config.extreme_scale
            
            if abs(c) < 1e-10:  # Gumbel case (c ≈ 0)
                extreme = loc - scale * math.log(-math.log(u))
            else:
                # General case
                extreme = loc + (scale / c) * (1 - (-math.log(u)) ** (-c))
            
            return min(extreme, -0.05)  # At least -5%
    
    def _generate_pareto_extreme(self, seed: Optional[int] = None) -> float:
        """Generate extreme value using Pareto distribution.
        
        Pareto distribution is good for modeling tail risk.
        """
        if SCIPY_AVAILABLE and pareto:
            # Use scipy's Pareto distribution
            if seed is not None:
                np.random.seed(seed)
            # Pareto: b (shape) > 0, scale = minimum value
            # For crashes, we use negative returns
            # Transform: use abs(threshold) as scale, generate positive, then negate
            scale = abs(self.config.extreme_threshold)
            b = 2.5  # Shape parameter (higher = heavier tail)
            extreme_positive = pareto.rvs(b=b, scale=scale, size=1)[0]
            # Convert to negative (crash)
            extreme = -extreme_positive
            return min(extreme, -0.05)  # At least -5%
        else:
            # Manual Pareto implementation
            # Pareto CDF: F(x) = 1 - (scale/x)^b
            # Inverse: x = scale / (1-F)^(1/b)
            u = random.random()
            scale = abs(self.config.extreme_threshold)
            b = 2.5  # Shape parameter
            extreme_positive = scale / ((1 - u) ** (1.0 / b))
            extreme = -extreme_positive
            return min(extreme, -0.05)  # At least -5%
    
    def _generate_simple_extreme(self, rng: random.Random) -> float:
        """Generate extreme value using simple threshold-based approach.
        
        Fallback method when distributions are not available.
        """
        # Use threshold with some randomness
        base_threshold = self.config.extreme_threshold
        # Add some variation (±20% of threshold)
        variation = rng.uniform(-0.2, 0.2) * abs(base_threshold)
        extreme = base_threshold + variation
        return min(extreme, -0.05)  # At least -5%


def create_default_config() -> StressTestConfig:
    """Create default stress test configuration."""
    return StressTestConfig(
        enabled=False,  # Disabled by default
        jump_probability=0.02,  # 2% chance
        jump_sizes=[-0.20, -0.15, -0.10],  # -20%, -15%, -10% crashes
        jump_direction="down",
    )


def create_aggressive_config() -> StressTestConfig:
    """Create aggressive stress test configuration (more frequent jumps)."""
    return StressTestConfig(
        enabled=True,
        jump_probability=0.05,  # 5% chance
        jump_sizes=[-0.25, -0.20, -0.15, -0.10],  # Larger crashes
        jump_direction="down",
    )


def create_moderate_config() -> StressTestConfig:
    """Create moderate stress test configuration."""
    return StressTestConfig(
        enabled=True,
        jump_probability=0.02,  # 2% chance
        jump_sizes=[-0.15, -0.10, -0.05],  # Smaller crashes
        jump_direction="down",
    )


class QuantileRegressionModel:
    """Quantile Regression model for predicting extreme returns.
    
    Stage 3: Uses machine learning to predict extreme quantiles based on
    market features (technical indicators, volatility, etc.).
    """
    
    def __init__(
        self,
        quantile_levels: List[float] = None,
        lookback_days: int = 30,
        use_ml: bool = True
    ):
        """Initialize quantile regression model.
        
        Args:
            quantile_levels: List of quantile levels to predict (e.g., [0.01, 0.05, 0.95, 0.99])
            lookback_days: Number of days to use for feature calculation
            use_ml: Whether to use machine learning (requires sklearn)
        """
        self.quantile_levels = quantile_levels or [0.01, 0.05, 0.95, 0.99]
        self.lookback_days = lookback_days
        self.use_ml = use_ml and SKLEARN_AVAILABLE
        self.models = {}  # Store trained models for each quantile
        self.is_trained = False
    
    def calculate_features(self, price_history: List[float]) -> np.ndarray:
        """Calculate technical features from price history.
        
        Args:
            price_history: List of historical prices (most recent last)
        
        Returns:
            Feature vector as numpy array
        """
        if len(price_history) < 2:
            return np.array([0.0, 0.0, 0.0, 0.0, 0.0, 0.0])
        
        prices = np.array(price_history[-self.lookback_days:])
        returns = np.diff(prices) / prices[:-1]
        
        # Feature 1: Mean return
        mean_return = np.mean(returns) if len(returns) > 0 else 0.0
        
        # Feature 2: Volatility
        volatility = np.std(returns) if len(returns) > 0 else 0.0
        
        # Feature 3: Momentum
        if len(returns) >= 10:
            recent = np.mean(returns[-5:])
            previous = np.mean(returns[-10:-5])
            momentum = recent - previous
        else:
            momentum = 0.0
        
        # Feature 4: Price position
        if len(prices) > 0:
            price_min = np.min(prices)
            price_max = np.max(prices)
            price_position = (prices[-1] - price_min) / (price_max - price_min) if price_max > price_min else 0.5
        else:
            price_position = 0.5
        
        # Feature 5: Max drawdown
        if len(prices) > 1:
            cumulative = np.cumprod(1 + returns)
            running_max = np.maximum.accumulate(cumulative)
            drawdown = (cumulative - running_max) / running_max
            max_drawdown = np.min(drawdown) if len(drawdown) > 0 else 0.0
        else:
            max_drawdown = 0.0
        
        # Feature 6: Volatility trend
        if len(returns) >= 10:
            recent_vol = np.std(returns[-5:])
            previous_vol = np.std(returns[-10:-5])
            vol_trend = recent_vol - previous_vol if previous_vol > 0 else 0.0
        else:
            vol_trend = 0.0
        
        return np.array([mean_return, volatility, momentum, price_position, max_drawdown, vol_trend])
    
    def predict_extreme_quantile(
        self,
        price_history: List[float],
        quantile: float = 0.01,
        seed: Optional[str] = None
    ) -> float:
        """Predict extreme quantile return for given price history.
        
        Args:
            price_history: Historical prices (most recent last)
            quantile: Quantile level to predict (e.g., 0.01 for 1% tail)
            seed: Random seed for reproducibility
        
        Returns:
            Predicted extreme return (as fraction, e.g., -0.20 for -20%)
        """
        if not self.use_ml or not self.is_trained:
            return self._predict_simple_quantile(price_history, quantile)
        
        if len(price_history) < self.lookback_days:
            return self._predict_simple_quantile(price_history, quantile)
        
        features = self.calculate_features(price_history)
        features = features.reshape(1, -1)
        
        closest_quantile = min(self.quantile_levels, key=lambda x: abs(x - quantile))
        
        if closest_quantile in self.models and self.models[closest_quantile] is not None:
            try:
                prediction = self.models[closest_quantile].predict(features)[0]
                return max(min(prediction, -0.05), -0.50)
            except Exception:
                return self._predict_simple_quantile(price_history, quantile)
        else:
            return self._predict_simple_quantile(price_history, quantile)
    
    def _predict_simple_quantile(self, price_history: List[float], quantile: float) -> float:
        """Simple quantile prediction using historical statistics."""
        if len(price_history) < 10:
            return -0.15
        
        prices = np.array(price_history[-30:])
        returns = np.diff(prices) / prices[:-1]
        
        if len(returns) > 0:
            extreme_return = np.quantile(returns, quantile)
            return min(extreme_return, -0.05)
        else:
            return -0.15

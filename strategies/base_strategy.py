"""Base strategy interface for algorithmic trading strategies.

All user-defined strategies must inherit from BaseStrategy and implement
the required methods.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Tuple


class BaseStrategy(ABC):
    """Base class for all trading strategies.
    
    Users must implement:
    - init(): Initialize strategy parameters
    - next(): Generate trading signals for each time step
    
    Example:
        class MyStrategy(BaseStrategy):
            def init(self):
                self.lookback = 20
            
            def next(self, current_data, portfolio):
                # current_data: Dict with 'date', 'prices', 'volumes', etc.
                # portfolio: Dict of current holdings {code: shares}
                # Return: List of (action, code, shares) tuples
                return [('buy', 'AAPL', 10)]
    """
    
    def __init__(self, name: str = None):
        """Initialize strategy.
        
        Args:
            name: Strategy name (defaults to class name)
        """
        self.name = name or self.__class__.__name__
        self.init()
    
    @abstractmethod
    def init(self):
        """Initialize strategy parameters.
        
        Called once when strategy is instantiated.
        Override this method to set up your strategy's parameters.
        """
        pass
    
    @abstractmethod
    def next(self, current_data: Dict, portfolio: Dict[str, int]) -> List[Tuple[str, str, int]]:
        """Generate trading signals for the current time step.
        
        Args:
            current_data: Dictionary containing:
                - 'date': datetime.date - Current date
                - 'prices': Dict[str, float] - Current prices for all stocks {code: price}
                - 'history': Dict[str, pd.DataFrame] - Historical OHLC data {code: DataFrame}
                - 'available_stocks': List[str] - List of available stock codes
            portfolio: Current portfolio holdings {stock_code: number_of_shares}
        
        Returns:
            List of (action, stock_code, shares) tuples where:
            - action: 'buy', 'sell', or 'hold'
            - stock_code: Stock code (e.g., 'AAPL')
            - shares: Number of shares (positive integer)
            
            Examples:
                [('buy', 'AAPL', 10)]  # Buy 10 shares of AAPL
                [('sell', 'MSFT', 5)]  # Sell 5 shares of MSFT
                []  # Hold (no action)
                [('buy', 'AAPL', 10), ('sell', 'MSFT', 5)]  # Multiple actions
        """
        pass
    
    def get_name(self) -> str:
        """Get strategy name."""
        return self.name
    
    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}: {self.name}>"

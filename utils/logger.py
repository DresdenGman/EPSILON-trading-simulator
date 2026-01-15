"""Simple logging helper for the simulator.

This is a lightweight reconstruction of the previous logger module:
it provides a single ``get_logger(name)`` function used across the app.
"""

import logging
from typing import Optional

_configured = False


def _configure_root_logger(level: int = logging.INFO) -> None:
    global _configured
    if _configured:
        return

    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    _configured = True


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """Return a module-level logger with standard formatting."""
    _configure_root_logger()
    return logging.getLogger(name)




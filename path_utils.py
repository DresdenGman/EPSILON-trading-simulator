"""Path utilities for EPSILON stock trading simulator.

Responsibilities:
1. Locate resources correctly in both source and PyInstaller bundles.
2. Provide a stable, cross-platform user data directory.
3. Offer helpers like ``get_user_data_file`` for JSON/data/API key files.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Optional

try:
    # Optional but recommended; project already lists appdirs as dependency
    from appdirs import user_data_dir

    APPDIRS_AVAILABLE = True
except Exception:
    user_data_dir = None  # type: ignore[assignment]
    APPDIRS_AVAILABLE = False

from version import APP_NAME, APP_ID


def _is_frozen() -> bool:
    """Return True if running in a PyInstaller bundle."""
    return getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS")


def get_app_root() -> Path:
    """Return the root directory of the app install/bundle.

    - In dev mode: directory containing this file.
    - In PyInstaller bundle: the temporary extraction directory (_MEIPASS).
    """
    if _is_frozen():
        return Path(getattr(sys, "_MEIPASS"))  # type: ignore[arg-type]
    return Path(__file__).resolve().parent


def get_resource_path(relative_path: str) -> Path:
    """Return the absolute path to a bundled resource.

    ``relative_path`` is relative to the project root (for dev) or
    the PyInstaller bundle root.
    """
    root = get_app_root()
    return root.joinpath(relative_path).resolve()


def get_user_data_dir() -> Path:
    """Return platform-appropriate user data directory for EPSILON."""
    if APPDIRS_AVAILABLE and user_data_dir is not None:
        path_str = user_data_dir(APP_NAME, APP_ID)
        path = Path(path_str)
    else:
        # Fallback: use ~/.epsilon or equivalent
        home = Path.home()
        path = home / f".{APP_NAME.lower()}"

    path.mkdir(parents=True, exist_ok=True)
    return path


def get_user_data_file(filename: str) -> str:
    """Return absolute path for a file stored under user data directory."""
    return str(get_user_data_dir() / filename)


def get_config_file(filename: str) -> tuple[str, str]:
    """Return (user_data_path, fallback_path) for config files.
    
    Returns tuple of (user_data_dir/filename, app_root/filename).
    Used for config files that can be in user data or app root.
    """
    user_path = str(get_user_data_dir() / filename)
    fallback_path = str(get_app_root() / filename)
    return user_path, fallback_path


def ensure_user_data_dir() -> Path:
    """Ensure user data directory exists and return it."""
    return get_user_data_dir()


def ensure_subdir(subdir: str) -> Path:
    """Ensure a named subdirectory under user data dir exists."""
    base = get_user_data_dir()
    target = base / subdir
    target.mkdir(parents=True, exist_ok=True)
    return target


def resource_path(relative_path: str) -> str:
    """Alias for get_resource_path for compatibility with mock.py."""
    return str(get_resource_path(relative_path))


def migrate_legacy_file(local_path: str, target_name: Optional[str] = None) -> str:
    """If a file exists next to mock.py (legacy), move it into user data dir.

    Returns the new absolute path (or existing path if migration not needed).
    """
    src = Path(local_path)
    if not src.exists():
        return get_user_data_file(target_name or src.name)

    dst = Path(get_user_data_file(target_name or src.name))
    if not dst.exists():
        try:
            dst.write_bytes(src.read_bytes())
        except Exception:
            # If copy fails, just fall back to original path
            return str(src)
    return str(dst)




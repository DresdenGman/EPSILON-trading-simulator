"""Application version and branding information for EPSILON.

Central place to manage app name, version, author/company and
disclaimer text so that desktop app, website, docs and installers
can stay consistent.
"""

APP_NAME = "EPSILON"
APP_ID = "epsilon.trading.simulator"

# Semantic versioning; can be updated before releases
APP_VERSION = "0.9.0-beta"

APP_DESCRIPTION = "Advanced stock trading research & simulation workstation."
APP_COMPANY = "EPSILON Lab"
APP_COPYRIGHT = "© 2026 EPSILON Lab. All rights reserved."

# Unified risk disclaimer (to be reused in app, README, website)
RISK_DISCLAIMER = (
    "This software is for personal learning and research purposes only. "
    "It does not constitute any investment advice or trading recommendations.\n\n"
    "All historical returns, simulation results, and AI analysis are hypothetical scenarios "
    "and do not represent actual market performance.\n\n"
    "Any investment decisions made based on this software and their consequences "
    "are the sole responsibility of the user."
)

# Compatibility exports for mock.py
VERSION = APP_VERSION
VERSION_INFO = {
    "app_name": APP_NAME,
    "version": APP_VERSION,
    "description": APP_DESCRIPTION,
    "company": APP_COMPANY,
    "copyright": APP_COPYRIGHT
}

DISCLAIMER_TEXT = RISK_DISCLAIMER


def full_version() -> str:
    """Return human-readable version string."""
    return f"{APP_NAME} {APP_VERSION}"


def get_version_string() -> str:
    """Return version string (e.g., 'v0.9.0-beta')."""
    return f"v{APP_VERSION}"


def get_full_version_info() -> str:
    """Return full version info string for About dialog."""
    return f"{APP_NAME} {APP_VERSION}\n\n{APP_DESCRIPTION}\n\n{APP_COPYRIGHT}"


def about_text() -> str:
    """Short About dialog content."""
    return (
        f"{full_version()}\n\n"
        f"{APP_DESCRIPTION}\n\n"
        f"{APP_COPYRIGHT}\n\n"
        f"{RISK_DISCLAIMER}"
    )




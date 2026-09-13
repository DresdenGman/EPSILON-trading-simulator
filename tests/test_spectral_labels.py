"""Ensure desktop spectral labels remain English without changing period conversions."""

import pytest

from analysis.spectral import format_period_description


@pytest.mark.parametrize("days, expected", [
    (2, "2.0-day cycle"),
    (7, "1.0-week cycle"),
    (17.5, "2.5-week cycle"),
    (30, "1.0-month cycle"),
    (60, "2.0-month cycle"),
    (365, "1.0-year cycle"),
    (730, "2.0-year cycle"),
])
def test_period_description_in_english(days, expected):
    assert format_period_description(days) == expected

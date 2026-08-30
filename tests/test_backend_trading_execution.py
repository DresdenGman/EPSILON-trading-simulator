"""Regression tests for server-authoritative market execution."""

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from backend.models.web_models import Base, TradeRecordDB, UserDB
from backend.services.trading_service import TradingService


def make_service(price_provider):
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    db = Session(engine)
    user = UserDB(
        email="test@example.com",
        username="test-user",
        hashed_password="not-used",
        initial_capital=100_000.0,
        cash=100_000.0,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return db, TradingService(db, user.id, price_provider=price_provider)


def test_market_buy_ignores_client_price_and_uses_server_quote():
    db, service = make_service(lambda _: 100.0)

    success, _ = service.buy_stock("AAPL", 10, client_price=1.0)

    assert success
    trade = db.execute(select(TradeRecordDB)).scalars().one()
    assert trade.price == 100.01
    db.close()


def test_portfolio_is_marked_to_server_quote():
    quotes = iter([100.0, 120.0])
    db, service = make_service(lambda _: next(quotes))
    assert service.buy_stock("AAPL", 10, client_price=100.0)[0]

    position = service.get_portfolio()[0]

    assert position["current_price"] == 120.0
    assert position["unrealized_pnl"] > 0
    db.close()


def test_market_trade_fails_without_a_server_quote():
    db, service = make_service(lambda _: None)

    success, message = service.buy_stock("AAPL", 10, client_price=100.0)

    assert not success
    assert "No market quote" in message
    db.close()

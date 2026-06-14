from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from backend.config import DATABASE_URL

_is_sqlite = DATABASE_URL.startswith("sqlite")

connect_args = {}
pool_kwargs = {}

if _is_sqlite:
    connect_args = {"check_same_thread": False}
else:
    pool_kwargs = {
        "pool_size": 5,
        "max_overflow": 10,
        "pool_recycle": 3600,
    }

engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args=connect_args,
    pool_pre_ping=True,
    **pool_kwargs,
)

if _is_sqlite:

    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_database():
    from backend.models.web_models import Base
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

import os

# Database: PostgreSQL (production) with SQLite fallback (local dev)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://a24300@localhost:5432/epsilon_api",
)
APP_ENV = os.getenv("APP_ENV", "development").lower()
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    if APP_ENV == "production":
        raise RuntimeError("SECRET_KEY is required when APP_ENV=production")
    SECRET_KEY = "epsilon-local-development-only"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7
INITIAL_CAPITAL = float(os.getenv("INITIAL_CAPITAL", "100000.0"))
# Credentialed browser requests must name their allowed origins explicitly.
# Configure production origins through CORS_ORIGINS rather than falling back to "*".
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
).split(",")
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"

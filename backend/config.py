import os

# Database: PostgreSQL (production) with SQLite fallback (local dev)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://a24300@localhost:5432/epsilon_api",
)
SECRET_KEY = os.getenv("SECRET_KEY", "epsilon-dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7
INITIAL_CAPITAL = float(os.getenv("INITIAL_CAPITAL", "100000.0"))
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

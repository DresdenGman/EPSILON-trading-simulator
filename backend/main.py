"""
EPSILON Trading Simulator — FastAPI Backend
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.config import CORS_ORIGINS
from backend.database import init_database
from backend.routers import auth, trading, analysis


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_database()
    yield


app = FastAPI(
    title="EPSILON Trading Simulator API",
    version="0.9.0",
    description="REST API for the EPSILON stock trading simulator",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(trading.router)
app.include_router(analysis.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "0.9.0"}

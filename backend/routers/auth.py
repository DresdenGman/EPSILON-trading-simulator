from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import timedelta

from backend.database import get_db
from backend.models.web_models import UserDB
from backend.utils.security import (
    verify_password, get_password_hash, create_access_token, decode_access_token
)
from backend.schemas.schemas import (
    UserCreate, UserLogin, UserResponse, Token, MessageResponse
)
from backend.config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/api", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login", auto_error=False)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> UserDB:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    email = payload.get("sub")
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    user = db.execute(select(UserDB).where(UserDB.email == email)).scalars().first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/register", response_model=UserResponse)
def register(data: UserCreate, db: Session = Depends(get_db)):
    existing = db.execute(
        select(UserDB).where((UserDB.email == data.email) | (UserDB.username == data.username))
    ).scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Email or username already registered")

    user = UserDB(
        email=data.email,
        username=data.username,
        hashed_password=get_password_hash(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.execute(select(UserDB).where(UserDB.email == data.email)).scalars().first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: UserDB = Depends(get_current_user)):
    return current_user

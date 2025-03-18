from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db, User
from utils.password import verify_password
from utils.auth import create_access_token, get_current_user
from config import settings

router = APIRouter()


class Token(BaseModel):
    access_token: str
    token_type: str
    username: str


class UserResponse(BaseModel):
    id: int
    username: str
    is_owner: bool
    
    class Config:
        from_attributes = True  # Updated from orm_mode


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login", response_model=Token)
async def login_for_access_token(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """Authenticate user with JSON and return JWT token."""
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "username": user.username}


@router.get("/user", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user


@router.get("/check")
async def check_authentication(current_user: User = Depends(get_current_user)):
    """Check if user is authenticated."""
    return {"authenticated": True, "username": current_user.username}

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from database import get_db, User, Catalog
from utils.password import get_password_hash, verify_password
from utils.auth import get_current_user, get_owner_user

router = APIRouter()


class UserCreate(BaseModel):
    username: str
    password: str
    is_owner: bool = False


class UserUpdate(BaseModel):
    username: Optional[str] = None
    is_owner: Optional[bool] = None


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: int
    username: str
    is_owner: bool
    last_connected: Optional[datetime] = None

    class Config:
        from_attributes = True  # Updated from orm_mode


class CatalogAccessUpdate(BaseModel):
    catalog_ids: List[int]

@router.post("/", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_owner_user)  # Only owners can create users
):
    """Create a new user (owner only)."""
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        username=user_data.username,
        password=hashed_password,
        is_owner=user_data.is_owner,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.get("/", response_model=List[UserResponse])
async def get_all_users(
    db: Session = Depends(get_db),
):
    """Get all users (owner only)."""
    users = db.query(User).all()
    return users

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_owner_user)  # Only owners can see user details
):
    """Get user by ID (owner only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_owner_user)  # Only owners can update users
):
    """Update user (owner only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user fields
    if user_data.username is not None:
        # Check if username already exists
        existing_user = db.query(User).filter(User.username == user_data.username).first()
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        user.username = user_data.username
    
    if user_data.is_owner is not None:
        user.is_owner = user_data.is_owner
    
    db.commit()
    db.refresh(user)
    
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_owner_user) 
):
    """Delete user (owner only)."""
    # Prevent owner from deleting themselves
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account through this endpoint"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    
    return None


@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    password_data: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Change user password (any authenticated user for their own account)."""
    # Check if current password is correct
    if not verify_password(password_data.current_password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}

@router.get("/{username}/is-owner", response_model=bool)
async def is_owner(
    username: str,
    db: Session = Depends(get_db),
):
    """Check if a user is an owner."""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user.is_owner

@router.get("/{user_id}/catalogs", response_model=List[int])
async def get_user_catalogs(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_owner_user)  # Only owners can view user catalogs
):
    """Get list of catalog IDs a user has access to (owner only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    catalog_ids = [catalog.id for catalog in user.catalogs]
    return catalog_ids


@router.put("/{user_id}/catalogs", status_code=status.HTTP_200_OK)
async def update_user_catalogs(
    user_id: int,
    access_data: CatalogAccessUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_owner_user)  # Only owners can update user catalogs
):
    """Update which catalogs a user has access to (owner only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Clear existing access
    user.catalogs = []
    
    # Add new access
    for catalog_id in access_data.catalog_ids:
        catalog = db.query(Catalog).filter(Catalog.id == catalog_id).first()
        if catalog:
            user.catalogs.append(catalog)
    
    db.commit()
    
    return {"message": f"Catalog access updated for user {user.username}"}

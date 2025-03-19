from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db, User, Catalog
from utils.auth import get_current_user, get_owner_user

router = APIRouter()


class CatalogCreate(BaseModel):
    address: str
    private_key: str
    name: str
    description: Optional[str] = None


class CatalogUpdate(BaseModel):
    address: Optional[str] = None
    private_key: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None


class CatalogResponse(BaseModel):
    id: int
    address: str
    name: str
    description: Optional[str] = None
    private_key: Optional[str] = None

    class Config:
        from_attributes = True  # Updated from orm_mode


class CatalogAccessUpdate(BaseModel):
    user_ids: List[int]


@router.post("/", response_model=CatalogResponse)
async def create_catalog(
    catalog_data: CatalogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_owner_user)  # Only owners can create catalogs
):
    """Create a new catalog (owner only)."""
    # Check if catalog address already exists
    existing_catalog = db.query(Catalog).filter(Catalog.address == catalog_data.address).first()
    if existing_catalog:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Catalog with this address already exists"
        )
        


    print(catalog_data)    
    # Create new catalog
    new_catalog = Catalog(
        address=catalog_data.address,
        private_key=catalog_data.private_key,
        name=catalog_data.name,
        description=catalog_data.description
    )
    
    db.add(new_catalog)
    db.commit()
    db.refresh(new_catalog)
    
    return new_catalog


@router.get("/", response_model=List[CatalogResponse])
async def get_catalogs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get catalogs:
    - Owner gets all catalogs with private keys
    - Regular users get only catalogs they have access to, without private keys
    """
    if current_user.is_owner:
        # Owner gets all catalogs with private keys
        catalogs = db.query(Catalog).all()
    else:
        # Regular users get only catalogs they have access to
        catalogs = current_user.catalogs
        # Remove private keys for non-owners
        for catalog in catalogs:
            catalog.private_key = None
    
    return catalogs


@router.get("/{catalog_id}", response_model=CatalogResponse)
async def get_catalog(
    catalog_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a catalog by ID."""
    catalog = db.query(Catalog).filter(Catalog.id == catalog_id).first()
    if not catalog:
        raise HTTPException(status_code=404, detail="Catalog not found")
    
    # Check if user has access to this catalog
    if not current_user.is_owner and catalog not in current_user.catalogs:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this catalog"
        )
    
    # Hide private key for non-owners
    if not current_user.is_owner:
        catalog.private_key = None
    
    return catalog


@router.put("/{catalog_id}", response_model=CatalogResponse)
async def update_catalog(
    catalog_id: int,
    catalog_data: CatalogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_owner_user)  # Only owners can update catalogs
):
    """Update a catalog (owner only)."""
    catalog = db.query(Catalog).filter(Catalog.id == catalog_id).first()
    if not catalog:
        raise HTTPException(status_code=404, detail="Catalog not found")
    
    # Update catalog fields
    if catalog_data.address is not None:
        # Check if address already exists
        existing_catalog = db.query(Catalog).filter(Catalog.address == catalog_data.address).first()
        if existing_catalog and existing_catalog.id != catalog_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Catalog with this address already exists"
            )
        catalog.address = catalog_data.address
    
    if catalog_data.private_key is not None:
        catalog.private_key = catalog_data.private_key
    
    if catalog_data.name is not None:
        catalog.name = catalog_data.name
    
    if catalog_data.description is not None:
        catalog.description = catalog_data.description
    
    db.commit()
    db.refresh(catalog)
    
    return catalog


@router.delete("/{catalog_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_catalog(
    catalog_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_owner_user)  # Only owners can delete catalogs
):
    """Delete a catalog (owner only)."""
    catalog = db.query(Catalog).filter(Catalog.id == catalog_id).first()
    if not catalog:
        raise HTTPException(status_code=404, detail="Catalog not found")
    
    db.delete(catalog)
    db.commit()
    
    return None


@router.post("/{catalog_id}/access", status_code=status.HTTP_200_OK)
async def update_catalog_access(
    catalog_id: int,
    access_data: CatalogAccessUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_owner_user)  # Only owners can manage catalog access
):
    """Update which users have access to a catalog (owner only)."""
    catalog = db.query(Catalog).filter(Catalog.id == catalog_id).first()
    if not catalog:
        raise HTTPException(status_code=404, detail="Catalog not found")
    
    # Clear existing access
    catalog.users = []
    
    # Add new access
    for user_id in access_data.user_ids:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            catalog.users.append(user)
    
    db.commit()
    
    return {"message": f"Access updated for catalog {catalog.name}"}


@router.get("/{catalog_id}/access", response_model=List[int])
async def get_catalog_access(
    catalog_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_owner_user)  # Only owners can view catalog access
):
    """Get list of user IDs with access to a catalog (owner only)."""
    catalog = db.query(Catalog).filter(Catalog.id == catalog_id).first()
    if not catalog:
        return []
    
    user_ids = [user.id for user in catalog.users]
    return user_ids

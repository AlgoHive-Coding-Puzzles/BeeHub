import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse, Response
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db, User, Catalog
from utils.auth import get_current_user

router = APIRouter()


async def get_catalog_by_id(catalog_id: int, db: Session, current_user: User):
    """Get catalog and verify user has access."""
    catalog = db.query(Catalog).filter(Catalog.id == catalog_id).first()
    
    if not catalog:
        raise HTTPException(status_code=404, detail="Catalog not found")
    
    # Check if user has access to this catalog
    if not current_user.is_owner and catalog not in current_user.catalogs:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this catalog"
        )
    
    return catalog


@router.get("/catalog/{catalog_id}/themes")
async def proxy_get_themes(
    catalog_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Proxy endpoint to get themes from a catalog."""
    catalog = await get_catalog_by_id(catalog_id, db, current_user)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(
                f"{catalog.address}/themes",
                headers={"Authorization": f"Bearer {catalog.private_key}"}
            )
            return Response(
                content=response.content,
                status_code=response.status_code,
                media_type=response.headers.get("content-type", "application/json")
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Error communicating with catalog service: {str(e)}")


@router.post("/catalog/{catalog_id}/theme/reload")
async def proxy_reload_themes(
    catalog_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Proxy endpoint to reload themes in a catalog."""
    catalog = await get_catalog_by_id(catalog_id, db, current_user)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{catalog.address}/theme/reload",
                headers={"Authorization": f"Bearer {catalog.private_key}"}
            )
            return Response(
                content=response.content,
                status_code=response.status_code,
                media_type=response.headers.get("content-type", "application/json")
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Error communicating with catalog service: {str(e)}")


@router.delete("/catalog/{catalog_id}/theme")
async def proxy_delete_theme(
    catalog_id: int,
    name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Proxy endpoint to delete a theme from a catalog."""
    catalog = await get_catalog_by_id(catalog_id, db, current_user)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.delete(
                f"{catalog.address}/theme",
                params={"name": name},
                headers={"Authorization": f"Bearer {catalog.private_key}"}
            )
            return Response(
                content=response.content,
                status_code=response.status_code,
                media_type=response.headers.get("content-type", "application/json")
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Error communicating with catalog service: {str(e)}")


@router.post("/catalog/{catalog_id}/theme")
async def proxy_create_theme(
    catalog_id: int,
    name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Proxy endpoint to create a new theme in a catalog."""
    catalog = await get_catalog_by_id(catalog_id, db, current_user)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{catalog.address}/theme",
                params={"name": name},
                headers={"Authorization": f"Bearer {catalog.private_key}"}
            )
            return Response(
                content=response.content,
                status_code=response.status_code,
                media_type=response.headers.get("content-type", "application/json")
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Error communicating with catalog service: {str(e)}")


@router.get("/catalog/{catalog_id}/theme")
async def proxy_get_theme(
    catalog_id: int,
    name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Proxy endpoint to get a theme from a catalog."""
    catalog = await get_catalog_by_id(catalog_id, db, current_user)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(
                f"{catalog.address}/theme",
                params={"name": name},
                headers={"Authorization": f"Bearer {catalog.private_key}"}
            )
            return Response(
                content=response.content,
                status_code=response.status_code,
                media_type=response.headers.get("content-type", "application/json")
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Error communicating with catalog service: {str(e)}")


@router.post("/catalog/{catalog_id}/puzzle/upload")
async def proxy_upload_puzzle(
    catalog_id: int,
    theme: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Proxy endpoint to upload a puzzle to a catalog."""
    catalog = await get_catalog_by_id(catalog_id, db, current_user)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            content = await file.read()
            
            files = {"file": (file.filename, content, file.content_type)}
            
            response = await client.post(
                f"{catalog.address}/puzzle/upload",
                params={"theme": theme},
                headers={"Authorization": f"Bearer {catalog.private_key}"},
                files=files
            )
            
            return Response(
                content=response.content,
                status_code=response.status_code,
                media_type=response.headers.get("content-type", "application/json")
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Error communicating with catalog service: {str(e)}")


@router.delete("/catalog/{catalog_id}/puzzle")
async def proxy_delete_puzzle(
    catalog_id: int,
    theme: str,
    puzzle: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Proxy endpoint to delete a puzzle from a catalog."""
    catalog = await get_catalog_by_id(catalog_id, db, current_user)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.delete(
                f"{catalog.address}/puzzle",
                params={"theme": theme, "puzzle": puzzle},
                headers={"Authorization": f"Bearer {catalog.private_key}"}
            )
            return Response(
                content=response.content,
                status_code=response.status_code,
                media_type=response.headers.get("content-type", "application/json")
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Error communicating with catalog service: {str(e)}")


@router.get("/test-connection")
async def test_connection(
    host: str,
    port: int,
    key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Test connection to a catalog service with the provided key."""
    # Only owners can test connections
    if not current_user.is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners can test service connections"
        )
    
    address = f"http://{host}:{port}"
    key = key.replace(" ", "+")
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(
                f"{address}/apikey",
                headers={"Authorization": f"Bearer {key}"},
                timeout=5.0  # Short timeout for quick feedback
            )
            
            return {
                "success": response.status_code == 200,
                "status_code": response.status_code,
                "message": "Connection successful" if response.status_code == 200 else "Connection failed"
            }
        except httpx.RequestError as e:
            return {
                "success": False,
                "status_code": None,
                "message": f"Error connecting to service: {str(e)}"
            }

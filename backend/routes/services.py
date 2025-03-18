from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Any
from pydantic import BaseModel

from database import get_db, DiscoveredService
from utils.auth import get_current_user, get_owner_user
from services.discovery import service_discovery

router = APIRouter()


class ServiceResponse(BaseModel):
    id: int
    name: str
    service_type: str
    host: str
    port: Optional[int]
    status: str
    additional_ports: Optional[List[int]]
    
    class Config:
        from_attributes = True  # Updated from orm_mode


class ServiceDetail(ServiceResponse):
    details: Optional[dict]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # Updated from orm_mode


def run_discovery(target_ports: Optional[List[int]] = None):
    """Background task to discover services"""
    service_discovery.sync_with_database(target_ports)


@router.get("/", response_model=List[ServiceResponse])
async def get_services(
    background_tasks: BackgroundTasks,
    refresh: bool = False,
    ports: Optional[str] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Get all discovered services with optional filtering"""
    target_ports = None
    if ports:
        try:
            target_ports = [int(p) for p in ports.split(',')]
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid port format. Provide comma-separated list of port numbers."
            )
    
    # Run discovery in background if refresh is requested
    if refresh:
        background_tasks.add_task(run_discovery, target_ports)
    
    # Build the query with filters
    query = db.query(DiscoveredService)
    
    # Filter by service type if specified
    if type:
        if type not in ["docker", "local"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid service type. Must be 'docker' or 'local'."
            )
        query = query.filter(DiscoveredService.service_type == type)
    
    # Get all services first
    services = query.all()
    
    # Filter by port if specified (needs to be done manually due to JSON field)
    if target_ports:
        filtered_services = []
        for service in services:
            # Check if main port is in target_ports
            if service.port in target_ports:
                filtered_services.append(service)
                continue
                
            # Check if any additional port is in target_ports
            if service.additional_ports:
                if any(port in target_ports for port in service.additional_ports):
                    filtered_services.append(service)
        
        return filtered_services
    
    return services


@router.get("/{service_id}", response_model=ServiceDetail)
async def get_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Get a specific service by ID"""
    service = db.query(DiscoveredService).filter(DiscoveredService.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    return service


@router.post("/discover", status_code=status.HTTP_202_ACCEPTED)
async def trigger_discovery(
    background_tasks: BackgroundTasks,
    ports: Optional[str] = None,
    current_user: Any = Depends(get_owner_user)  # Only owners can trigger discovery
):
    """Trigger service discovery"""
    target_ports = None
    if ports:
        try:
            target_ports = [int(p) for p in ports.split(',')]
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid port format. Provide comma-separated list of port numbers."
            )
    
    background_tasks.add_task(run_discovery, target_ports)
    return {"message": "Service discovery started"}

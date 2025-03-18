from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
import uvicorn
import asyncio

from routes import auth, users, catalogs, services
from database import create_tables, create_admin_user
from services.discovery import service_discovery

# All the ports from 5000 to 5100
TARGET_PORTS = list(range(5000, 5100))

# Setup lifespan context manager (replacing on_event)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    create_tables()
    create_admin_user()
    
    # Perform initial discovery of Docker and local services
    service_discovery.sync_with_database(target_ports=TARGET_PORTS)
    
    # Start periodic discovery task
    task = asyncio.create_task(periodic_discovery())
    
    yield  # This is where the app runs
    
    # Shutdown actions
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


# Periodic discovery function
async def periodic_discovery():
    while True:
        try:
            service_discovery.sync_with_database(target_ports=TARGET_PORTS)
        except Exception as e:
            print(f"Error in periodic discovery: {e}")
        # Wait 30 seconds before next discovery
        await asyncio.sleep(30)


# Initialize FastAPI with enhanced OpenAPI documentation
app = FastAPI(
    title="BeeHub API",
    description="""
    API for BeeHub catalog management.
    
    ## Features
    
    * User authentication and management
    * Catalog access control
    * Service discovery
    
    ## Authentication
    
    All protected endpoints require a JWT token, obtained by logging in via `/auth/login`.
    Pass the token in the Authorization header as: `Bearer your_token_here`
    """,
    version="1.0.0",
    lifespan=lifespan,
    openapi_tags=[
        {"name": "Authentication", "description": "User login, registration and session management"},
        {"name": "Users", "description": "User management operations"},
        {"name": "Catalogs", "description": "Catalog management and access control"},
        {"name": "Services", "description": "Service discovery and management"}
    ],
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(catalogs.router, prefix="/catalogs", tags=["Catalogs"])
app.include_router(services.router, prefix="/services", tags=["Services"])


@app.get("/")
async def root():
    return {"message": "Welcome to BeeAPI Backend"}


# Add redirect from /apidocs/ to /docs for Swagger UI
@app.get("/apidocs/", include_in_schema=False)
async def swagger_redirect():
    return RedirectResponse(url="/docs")


# Custom exception handler to ensure all errors are returned as JSON
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc)},
    )


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8081, reload=True)

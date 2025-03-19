from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, Table, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

from config import settings
from utils.password import get_password_hash

# Create database engine with improved connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
    pool_size=20,           # Increase from default 5
    max_overflow=20,        # Increase from default 10
    pool_timeout=60,        # Increase connection timeout
    pool_recycle=3600,      # Recycle connections after 1 hour
    pool_pre_ping=True      # Test connections before using them
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Define association table for many-to-many relationship
can_access = Table(
    'can_access',
    Base.metadata,
    Column('id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('id_1', Integer, ForeignKey('catalogs.id'), primary_key=True)
)


# Define models based on SQL schema
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    last_connected = Column(DateTime, default=None)
    is_owner = Column(Boolean, default=False, nullable=False)
    
    # Define relationship to catalogs
    catalogs = relationship(
        "Catalog",
        secondary=can_access,
        back_populates="users"
    )


class Catalog(Base):
    __tablename__ = "catalogs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    address = Column(String(50), unique=True, nullable=False)
    private_key = Column(String(50), nullable=False)
    name = Column(String(50), nullable=False)
    description = Column(String(255), nullable=True)
    
    # Define relationship to users
    users = relationship(
        "User",
        secondary=can_access,
        back_populates="catalogs"
    )


# New model for discovered services (both Docker and local)
class DiscoveredService(Base):
    __tablename__ = "discovered_services"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    service_id = Column(String(64), unique=True, nullable=False)  # Container ID or local service ID
    name = Column(String(100), nullable=False)
    service_type = Column(String(20), nullable=False)  # "docker" or "local"
    host = Column(String(100), nullable=False, default="localhost")
    port = Column(Integer, nullable=True)
    status = Column(String(50), nullable=False)
    additional_ports = Column(JSON, nullable=True)  # Store additional ports
    details = Column(JSON, nullable=True)  # Store service-specific details
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables in the database."""
    Base.metadata.create_all(bind=engine)


def create_admin_user():
    """Create admin user if it doesn't exist."""
    db = SessionLocal()
    
    # Check if admin user already exists
    admin = db.query(User).filter(User.username == settings.ADMIN_USERNAME).first()
    
    if not admin:
        # Create admin user
        hashed_password = get_password_hash(settings.ADMIN_PASSWORD)
        admin_user = User(
            username=settings.ADMIN_USERNAME,
            password=hashed_password,
            is_owner=True,
            last_connected=datetime.utcnow()
        )
        db.add(admin_user)
        db.commit()
        print(f"Admin user '{settings.ADMIN_USERNAME}' created successfully")
    
    db.close()

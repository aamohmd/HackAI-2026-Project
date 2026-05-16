import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    full_name = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)

    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    dossiers = relationship("Dossier", back_populates="user", cascade="all, delete-orphan")


class VerificationCode(Base):
    __tablename__ = "verification_codes"
    
    phone_number = Column(String, primary_key=True, index=True)
    code = Column(String, nullable=False)
    created_at = Column(String, default=lambda: datetime.now().isoformat())

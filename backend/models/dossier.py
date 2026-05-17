import uuid
from datetime import datetime
from sqlalchemy import Column, String, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from ..database import Base

class Dossier(Base):
    __tablename__ = "dossiers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    state = Column(JSON, nullable=False, default={})
    status = Column(String, default="draft") # draft, sealed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="dossiers")

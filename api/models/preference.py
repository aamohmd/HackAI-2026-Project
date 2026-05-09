import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, event
from sqlalchemy.orm import relationship
from ..database import Base
from .user import User

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, index=True, nullable=False)
    theme = Column(String, default="system", nullable=False)
    language = Column(String, default="en", nullable=False)
    timezone = Column(String, default="UTC", nullable=False)
    marketing_emails = Column(Boolean, default=False, nullable=False)
    security_emails = Column(Boolean, default=True, nullable=False)
    update_emails = Column(Boolean, default=True, nullable=False)

    user = relationship("User", back_populates="preferences")

# Ensure User model has the back_populates relationship
User.preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")

@event.listens_for(User, "after_insert")
def create_user_preferences(mapper, connection, target):
    connection.execute(
        UserPreference.__table__.insert().values(
            id=str(uuid.uuid4()),
            user_id=target.id,
            theme="system",
            language="en",
            timezone="UTC",
            marketing_emails=False,
            security_emails=True,
            update_emails=True
        )
    )

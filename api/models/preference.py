import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, event
from sqlalchemy.orm import relationship
from ..database import Base
from .user import User

DEFAULT_PREFERENCES = {
    "theme": "system",
    "language": "en",
    "timezone": "UTC",
    "marketing_emails": False,
    "security_emails": True,
    "update_emails": True
}

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, index=True, nullable=False)
    
    theme = Column(String, default=DEFAULT_PREFERENCES["theme"], nullable=False)
    language = Column(String, default=DEFAULT_PREFERENCES["language"], nullable=False)
    timezone = Column(String, default=DEFAULT_PREFERENCES["timezone"], nullable=False)
    marketing_emails = Column(Boolean, default=DEFAULT_PREFERENCES["marketing_emails"], nullable=False)
    security_emails = Column(Boolean, default=DEFAULT_PREFERENCES["security_emails"], nullable=False)
    update_emails = Column(Boolean, default=DEFAULT_PREFERENCES["update_emails"], nullable=False)

    user = relationship("User", back_populates="preferences")

@event.listens_for(User, "after_insert")
def create_user_preferences(mapper, connection, target):
    connection.execute(
        UserPreference.__table__.insert().values(
            id=str(uuid.uuid4()),
            user_id=target.id,
            **DEFAULT_PREFERENCES
        )
    )

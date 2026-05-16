from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    phone_number: str
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: str
    is_active: bool

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserPreferenceRead(BaseModel):
    theme: str
    language: str
    timezone: str
    marketing_emails: bool
    security_emails: bool
    update_emails: bool

    class Config:
        from_attributes = True

class UserPreferenceUpdate(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    marketing_emails: Optional[bool] = None
    security_emails: Optional[bool] = None
    update_emails: Optional[bool] = None

class UserDelete(BaseModel):
    password: str
    confirmation_phrase: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    phone_number: Optional[str] = None

class IntakeTextRequest(BaseModel):
    text: str
    state_json: str
    dossier_id: Optional[str] = None



import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserRead, UserUpdate, UserPreferenceRead, UserPreferenceUpdate, UserDelete
from ..dependencies import get_current_user
from ..utils import ensure_upload_dir, UPLOAD_DIR
from .auth import verify_password

router = APIRouter()

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "svg"}
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB

@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/me/preferences", response_model=UserPreferenceRead)
def get_preferences(current_user: User = Depends(get_current_user)):
    return current_user.preferences

@router.patch("/me/preferences", response_model=UserPreferenceRead)
def update_preferences(
    preference_update: UserPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    preferences = current_user.preferences
    if not preferences:
        raise HTTPException(status_code=404, detail="Preferences not found")
    
    update_data = preference_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(preferences, key, value)
    
    db.commit()
    db.refresh(preferences)
    return preferences

@router.patch("/me", response_model=UserRead)
def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    update_data = user_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/me/avatar", response_model=UserRead)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file type
    extension = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file type. Allowed types: JPG, PNG, SVG."
        )

    # Validate file size efficiently using the size attribute
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum size is 2MB."
        )

    # Delete old avatar if it exists to prevent orphaned files
    if current_user.avatar_url and current_user.avatar_url.startswith("/uploads/"):
        old_avatar_path = current_user.avatar_url.lstrip("/")
        if os.path.exists(old_avatar_path):
            try:
                os.remove(old_avatar_path)
            except OSError:
                pass  # Ignore errors if file cannot be deleted

    # Ensure upload directory exists
    ensure_upload_dir()

    # Generate unique filename
    filename = f"{uuid.uuid4()}.{extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Save file efficiently
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Update user avatar_url
    avatar_url = f"/uploads/{filename}"
    current_user.avatar_url = avatar_url
    db.commit()
    db.refresh(current_user)

    return current_user

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    user_delete: UserDelete,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify password
    if not verify_password(user_delete.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password"
        )
    
    # Verify confirmation phrase
    if user_delete.confirmation_phrase != "DELETE MY ACCOUNT":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid confirmation phrase"
        )
    
    # Perform cascading delete
    db.delete(current_user)
    db.commit()
    return None

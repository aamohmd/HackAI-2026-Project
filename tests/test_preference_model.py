import pytest
from backend.models.user import User
from backend.models.preference import UserPreference

def test_user_preference_auto_creation(db):
    # 1. Create a user
    user = User(
        email="pref_test@example.com",
        hashed_password="hashed_password",
        full_name="Preference Test User"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 2. Check if UserPreference was automatically created via listener
    preferences = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
    
    assert preferences is not None
    assert preferences.user_id == user.id
    assert preferences.theme == "system"
    assert preferences.language == "en"
    assert preferences.timezone == "UTC"
    assert preferences.marketing_emails is False
    assert preferences.security_emails is True
    assert preferences.update_emails is True

def test_user_preference_fields(db):
    user = User(
        email="fields_test@example.com",
        hashed_password="hashed_password"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Manually update preferences
    preferences = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
    preferences.theme = "dark"
    preferences.language = "fr"
    preferences.marketing_emails = True
    db.commit()
    db.refresh(preferences)

    assert preferences.theme == "dark"
    assert preferences.language == "fr"
    assert preferences.marketing_emails is True

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from api.models import User
from api.routes.auth import create_token
from datetime import timedelta

@pytest.fixture
def test_user(db: Session):
    user = User(
        email="pref_test@example.com",
        hashed_password="hashedpassword",
        full_name="Pref Test User",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token = create_token(
        data={"sub": str(user.id), "type": "access"},
        expires_delta=timedelta(minutes=30)
    )
    return user, access_token

def test_get_preferences(client: TestClient, test_user):
    user, token = test_user
    response = client.get(
        "/users/me/preferences",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["theme"] == "system"
    assert data["language"] == "en"
    assert data["timezone"] == "UTC"
    assert data["marketing_emails"] == False
    assert data["security_emails"] == True
    assert data["update_emails"] == True

def test_update_preferences(client: TestClient, test_user):
    user, token = test_user
    update_data = {
        "theme": "dark",
        "marketing_emails": True
    }
    response = client.patch(
        "/users/me/preferences",
        headers={"Authorization": f"Bearer {token}"},
        json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["theme"] == "dark"
    assert data["marketing_emails"] == True
    assert data["language"] == "en"  # Unchanged

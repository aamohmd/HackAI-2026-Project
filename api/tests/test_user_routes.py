import pytest
from api.models import User
from api.routes.auth import create_token
from datetime import timedelta

@pytest.fixture
def test_user(db):
    user = User(
        phone_number="+212600000000",
        hashed_password="hashedpassword",
        full_name="Test User",
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

def test_update_user_profile(client, test_user):
    user, token = test_user
    
    response = client.patch(
        "/users/me",
        json={"full_name": "Updated Name", "bio": "New Bio"},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Updated Name"
    assert data["bio"] == "New Bio"
    assert data["phone_number"] == user.phone_number

def test_get_user_profile(client, test_user):
    user, token = test_user
    
    response = client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["phone_number"] == user.phone_number
    assert data["full_name"] == user.full_name

def test_update_user_profile_unauthorized(client):
    response = client.patch(
        "/users/me",
        json={"full_name": "Updated Name"}
    )
    assert response.status_code == 401

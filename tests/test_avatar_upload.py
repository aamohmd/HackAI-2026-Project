import pytest
import io
import os
from backend.models import User
from backend.routes.auth import create_token
from datetime import timedelta

@pytest.fixture
def test_user(db):
    user = User(
        email="testavatar_upload@example.com",
        hashed_password="hashedpassword",
        full_name="Avatar User",
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

def test_upload_avatar_success(client, test_user):
    user, token = test_user
    
    # Create a dummy image
    file_content = b"fake image content"
    file = io.BytesIO(file_content)
    
    response = client.post(
        "/users/me/avatar",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("test.png", file, "image/png")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "avatar_url" in data
    assert data["avatar_url"].startswith("/uploads/")
    assert data["avatar_url"].endswith(".png")
    
    # Check if file exists
    filename = data["avatar_url"].split("/")[-1]
    assert os.path.exists(f"./uploads/{filename}")

def test_upload_avatar_too_large(client, test_user):
    user, token = test_user
    
    # Create a dummy file larger than 2MB
    file_content = b"0" * (2 * 1024 * 1024 + 1)
    file = io.BytesIO(file_content)
    
    response = client.post(
        "/users/me/avatar",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("large.png", file, "image/png")}
    )
    
    assert response.status_code == 413
    assert response.json()["detail"] == "File too large. Maximum size is 2MB."

def test_upload_avatar_invalid_type(client, test_user):
    user, token = test_user
    
    # Create a dummy text file
    file_content = b"fake text content"
    file = io.BytesIO(file_content)
    
    response = client.post(
        "/users/me/avatar",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("test.txt", file, "text/plain")}
    )
    
    assert response.status_code == 415
    assert response.json()["detail"] == "Unsupported file type. Allowed types: JPG, PNG, SVG."

def test_upload_avatar_unauthorized(client):
    file_content = b"fake image content"
    file = io.BytesIO(file_content)
    
    response = client.post(
        "/users/me/avatar",
        files={"file": ("test.png", file, "image/png")}
    )
    
    assert response.status_code == 401

def test_upload_avatar_deletes_old_file(client, test_user):
    user, token = test_user
    
    # 1. Upload first avatar
    file1_content = b"first image content"
    file1 = io.BytesIO(file1_content)
    response1 = client.post(
        "/users/me/avatar",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("test1.png", file1, "image/png")}
    )
    assert response1.status_code == 200
    avatar1_url = response1.json()["avatar_url"]
    avatar1_path = f".{avatar1_url}"
    assert os.path.exists(avatar1_path)
    
    # 2. Upload second avatar
    file2_content = b"second image content"
    file2 = io.BytesIO(file2_content)
    response2 = client.post(
        "/users/me/avatar",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("test2.png", file2, "image/png")}
    )
    assert response2.status_code == 200
    avatar2_url = response2.json()["avatar_url"]
    avatar2_path = f".{avatar2_url}"
    assert os.path.exists(avatar2_path)
    
    # 3. Verify first avatar is deleted
    assert not os.path.exists(avatar1_path)
    assert avatar1_url != avatar2_url

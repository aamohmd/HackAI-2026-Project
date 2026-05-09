import pytest
import io
import os
import shutil
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from api.main import app
from api.database import Base, get_db
from api.models import User
from api.routes.auth import create_token
from datetime import timedelta

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_avatar.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./uploads"):
        shutil.rmtree("./uploads")

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def test_user(setup_db):
    db = TestingSessionLocal()
    user = User(
        email="testavatar@example.com",
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
    
    db.close()
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

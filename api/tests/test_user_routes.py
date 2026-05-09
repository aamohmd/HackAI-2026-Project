import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from api.main import app
from api.database import Base, get_db
from api.models import User
from api.routes.auth import create_token
from datetime import timedelta

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
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

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def test_user(setup_db):
    db = TestingSessionLocal()
    user = User(
        email="testuser@example.com",
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
    
    db.close()
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
    assert data["email"] == user.email

def test_get_user_profile(client, test_user):
    user, token = test_user
    
    response = client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == user.email
    assert data["full_name"] == user.full_name

def test_update_user_profile_unauthorized(client):
    response = client.patch(
        "/users/me",
        json={"full_name": "Updated Name"}
    )
    assert response.status_code == 401

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import shutil

from backend.main import app
from backend.database import Base, get_db
from backend.models import User
from backend.routes.auth import create_token, get_password_hash
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

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    # Create tables once for the whole session
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup after session
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test.db"):
        os.remove("./test.db")
    if os.path.exists("./uploads"):
        shutil.rmtree("./uploads")

@pytest.fixture(scope="function")
def db():
    # Provide a clean session for each test
    db = TestingSessionLocal()
    # Cleanup tables to avoid unique constraint violations
    db.execute(Base.metadata.tables['users'].delete())
    db.commit()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def test_user(db):
    user = User(
        phone_number="+212600000000",
        hashed_password=get_password_hash("testpassword"),
        full_name="Test User",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def auth_headers(test_user):
    access_token = create_token(
        data={"sub": str(test_user.id), "type": "access"},
        expires_delta=timedelta(minutes=30)
    )
    return {"Authorization": f"Bearer {access_token}"}

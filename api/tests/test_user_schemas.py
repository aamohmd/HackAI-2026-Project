from api.schemas import UserCreate, UserRead
import pytest

def test_user_schemas():
    user_data = {
        "phone_number": "+212600000000",
        "password": "password123",
        "full_name": "John Doe",
        "bio": "Hello",
        "avatar_url": "/uploads/avatar.png"
    }
    
    # Test UserCreate
    user_create = UserCreate(**user_data)
    assert user_create.phone_number == "+212600000000"
    assert user_create.full_name == "John Doe"
    assert user_create.bio == "Hello"
    assert user_create.avatar_url == "/uploads/avatar.png"
    
    # Test UserRead
    user_read_data = {
        "id": "123",
        "phone_number": "+212600000000",
        "is_active": True,
        "full_name": "John Doe",
        "bio": "Hello",
        "avatar_url": "/uploads/avatar.png"
    }
    user_read = UserRead(**user_read_data)
    assert user_read.id == "123"
    assert user_read.full_name == "John Doe"
    assert user_read.bio == "Hello"
    assert user_read.avatar_url == "/uploads/avatar.png"

def test_user_schemas_optional():
    user_data = {
        "phone_number": "+212600000000",
        "password": "password123"
    }
    user_create = UserCreate(**user_data)
    assert user_create.full_name is None
    assert user_create.bio is None
    assert user_create.avatar_url is None

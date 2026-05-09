from api.models import User

def test_user_profile_fields():
    user = User(
        email="test@example.com",
        full_name="John Doe",
        bio="Hello",
        avatar_url="/uploads/avatar.png"
    )
    assert user.full_name == "John Doe"
    assert user.bio == "Hello"
    assert user.avatar_url == "/uploads/avatar.png"

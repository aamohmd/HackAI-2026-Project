import pytest
from fastapi import status

def test_delete_account_success(client, test_user, auth_headers):
    """Test successful account deletion."""
    response = client.request(
        "DELETE",
        "/users/me",
        headers=auth_headers,
        json={
            "password": "testpassword",
            "confirmation_phrase": "DELETE MY ACCOUNT"
        }
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify user is deleted from database
    response = client.get("/users/me", headers=auth_headers)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_delete_account_wrong_password(client, test_user, auth_headers):
    """Test account deletion with wrong password."""
    response = client.request(
        "DELETE",
        "/users/me",
        headers=auth_headers,
        json={
            "password": "wrongpassword",
            "confirmation_phrase": "DELETE MY ACCOUNT"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Incorrect password"

def test_delete_account_wrong_phrase(client, test_user, auth_headers):
    """Test account deletion with wrong confirmation phrase."""
    response = client.request(
        "DELETE",
        "/users/me",
        headers=auth_headers,
        json={
            "password": "testpassword",
            "confirmation_phrase": "WRONG PHRASE"
        }
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "Invalid confirmation phrase"

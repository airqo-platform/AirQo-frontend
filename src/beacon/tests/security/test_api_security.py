import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import json

from app.main import app
from app.users import create_access_token

client = TestClient(app)

def test_unauthenticated_access():
    """Test that protected endpoints require authentication"""
    # Try to access a protected endpoint without a token
    response = client.get("/users/")
    
    assert response.status_code == 401
    assert "detail" in response.json()
    assert "authenticate" in response.json()["detail"].lower()

def test_invalid_token():
    """Test that invalid tokens are rejected"""
    # Add an invalid token to the headers
    headers = {"Authorization": "Bearer invalid_token_here"}
    response = client.get("/users/", headers=headers)
    
    assert response.status_code == 401
    assert "detail" in response.json()
    assert "credentials" in response.json()["detail"].lower()

def test_expired_token():
    """Test that expired tokens are rejected"""
    with patch("app.users.jwt.decode", side_effect=Exception("Expired token")):
        # Create a mock token
        headers = {"Authorization": "Bearer expired_token_here"}
        response = client.get("/users/", headers=headers)
        
        assert response.status_code == 401

def test_permission_based_access():
    """Test that role-based permissions are enforced"""
    # Create tokens with different roles
    admin_token = create_access_token({"sub": "admin@example.com"})
    user_token = create_access_token({"sub": "user@example.com"})
    
    # Mock the get_current_user function
    with patch("app.users.get_current_user") as mock_get_user:
        # Set up the mock to return an admin user
        admin_user = MagicMock()
        admin_user.email = "admin@example.com"
        admin_user.role = "superadmin"
        
        # Set up the mock to return a regular user
        regular_user = MagicMock()
        regular_user.email = "user@example.com"
        regular_user.role = "user"
        
        # Test admin endpoint with admin token
        mock_get_user.return_value = admin_user
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Create a test user
        test_user_data = {
            "email": "newuser@example.com",
            "password": "Password123!",
            "first_name": "Test",
            "last_name": "User",
            "role": "user",
            "status": "active"
        }
        
        admin_response = client.post(
            "/users/",
            headers=admin_headers,
            json=test_user_data
        )
        
        assert admin_response.status_code == 200
        
        # Test admin endpoint with user token
        mock_get_user.return_value = regular_user
        user_headers = {"Authorization": f"Bearer {user_token}"}
        
        user_response = client.post(
            "/users/",
            headers=user_headers,
            json=test_user_data
        )
        
        assert user_response.status_code == 403
        assert "forbidden" in user_response.json()["detail"].lower()

def test_sql_injection_protection():
    """Test that the API is protected against SQL injection"""
    # Try SQL injection in query parameters
    response = client.get("/devices/1' OR '1'='1")
    
    # Should return 404 instead of executing the injection
    assert response.status_code == 404
    
    # Try SQL injection in JSON body
    injection_data = {
        "email": "user@example.com'; DROP TABLE users; --",
        "password": "password123"
    }
    
    response = client.post("/login", data=injection_data)
    
    # Should return 422 (validation error) or 401 (unauthorized)
    assert response.status_code in [422, 401]
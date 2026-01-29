import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient, test_user_data: dict):
    """Test user registration."""
    response = await client.post("/api/v1/auth/register", json=test_user_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == test_user_data["email"]
    assert data["full_name"] == test_user_data["full_name"]
    assert data["university"] == test_user_data["university"]
    assert data["graduation_year"] == test_user_data["graduation_year"]
    assert "password" not in data
    assert "password_hash" not in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, test_user_data: dict):
    """Test that duplicate email registration fails."""
    # Register first user
    await client.post("/api/v1/auth/register", json=test_user_data)
    
    # Try to register with same email
    response = await client.post("/api/v1/auth/register", json=test_user_data)
    
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, test_user_data: dict):
    """Test successful login."""
    # Register user first
    await client.post("/api/v1/auth/register", json=test_user_data)
    
    # Login
    response = await client.post("/api/v1/auth/login", json={
        "email": test_user_data["email"],
        "password": test_user_data["password"],
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient, test_user_data: dict):
    """Test login with invalid password."""
    # Register user first
    await client.post("/api/v1/auth/register", json=test_user_data)
    
    # Try login with wrong password
    response = await client.post("/api/v1/auth/login", json={
        "email": test_user_data["email"],
        "password": "wrongpassword",
    })
    
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(client: AsyncClient):
    """Test login with non-existent user."""
    response = await client.post("/api/v1/auth/login", json={
        "email": "nonexistent@test.com",
        "password": "somepassword",
    })
    
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user(client: AsyncClient, test_user_data: dict):
    """Test getting current user info."""
    # Register and login
    await client.post("/api/v1/auth/register", json=test_user_data)
    login_response = await client.post("/api/v1/auth/login", json={
        "email": test_user_data["email"],
        "password": test_user_data["password"],
    })
    token = login_response.json()["access_token"]
    
    # Get current user
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user_data["email"]


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient, test_user_data: dict):
    """Test token refresh."""
    # Register and login
    await client.post("/api/v1/auth/register", json=test_user_data)
    login_response = await client.post("/api/v1/auth/login", json={
        "email": test_user_data["email"],
        "password": test_user_data["password"],
    })
    refresh_token = login_response.json()["refresh_token"]
    
    # Refresh tokens
    response = await client.post("/api/v1/auth/refresh", json={
        "refresh_token": refresh_token,
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    # New refresh token should be different (rotation)
    assert data["refresh_token"] != refresh_token


@pytest.mark.asyncio
async def test_logout(client: AsyncClient, test_user_data: dict):
    """Test logout."""
    # Register and login
    await client.post("/api/v1/auth/register", json=test_user_data)
    login_response = await client.post("/api/v1/auth/login", json={
        "email": test_user_data["email"],
        "password": test_user_data["password"],
    })
    tokens = login_response.json()
    
    # Logout
    response = await client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": tokens["refresh_token"]},
        headers={"Authorization": f"Bearer {tokens['access_token']}"}
    )
    
    assert response.status_code == 204
    
    # Try to use the refresh token again
    refresh_response = await client.post("/api/v1/auth/refresh", json={
        "refresh_token": tokens["refresh_token"],
    })
    
    assert refresh_response.status_code == 401


@pytest.mark.asyncio
async def test_access_protected_route_without_token(client: AsyncClient):
    """Test accessing protected route without token."""
    response = await client.get("/api/v1/auth/me")
    
    assert response.status_code == 403  # HTTPBearer returns 403 when no credentials


@pytest.mark.asyncio
async def test_access_protected_route_with_invalid_token(client: AsyncClient):
    """Test accessing protected route with invalid token."""
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalidtoken"}
    )
    
    assert response.status_code == 401

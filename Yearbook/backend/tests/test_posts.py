import pytest
from httpx import AsyncClient


async def create_user_and_login(client: AsyncClient, user_data: dict) -> str:
    """Helper to register user and return access token."""
    await client.post("/api/v1/auth/register", json=user_data)
    login_response = await client.post("/api/v1/auth/login", json={
        "email": user_data["email"],
        "password": user_data["password"],
    })
    return login_response.json()["access_token"]


@pytest.mark.asyncio
async def test_create_post(client: AsyncClient, test_user_data: dict):
    """Test creating a post."""
    token = await create_user_and_login(client, test_user_data)
    
    response = await client.post(
        "/api/v1/posts",
        json={"content": "Hello, this is my first post!"},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["content"] == "Hello, this is my first post!"
    assert data["author"]["full_name"] == test_user_data["full_name"]
    assert data["likes_count"] == 0
    assert data["comments_count"] == 0
    assert data["is_liked"] == False


@pytest.mark.asyncio
async def test_create_post_with_image(client: AsyncClient, test_user_data: dict):
    """Test creating a post with an image URL."""
    token = await create_user_and_login(client, test_user_data)
    
    response = await client.post(
        "/api/v1/posts",
        json={
            "content": "Check out this photo!",
            "image_url": "https://example.com/image.jpg"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["image_url"] == "https://example.com/image.jpg"


@pytest.mark.asyncio
async def test_get_feed(client: AsyncClient, test_user_data: dict):
    """Test getting the feed."""
    token = await create_user_and_login(client, test_user_data)
    
    # Create some posts
    for i in range(3):
        await client.post(
            "/api/v1/posts",
            json={"content": f"Post number {i+1}"},
            headers={"Authorization": f"Bearer {token}"}
        )
    
    # Get feed
    response = await client.get("/api/v1/posts")
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert len(data["items"]) == 3
    # Should be ordered by created_at desc (newest first)
    assert "Post number 3" in data["items"][0]["content"]


@pytest.mark.asyncio
async def test_get_feed_pagination(client: AsyncClient, test_user_data: dict):
    """Test feed pagination."""
    token = await create_user_and_login(client, test_user_data)
    
    # Create 5 posts
    for i in range(5):
        await client.post(
            "/api/v1/posts",
            json={"content": f"Post {i+1}"},
            headers={"Authorization": f"Bearer {token}"}
        )
    
    # Get first page
    response = await client.get("/api/v1/posts?limit=2&offset=0")
    data = response.json()
    assert len(data["items"]) == 2
    assert data["total"] == 5
    
    # Get second page
    response = await client.get("/api/v1/posts?limit=2&offset=2")
    data = response.json()
    assert len(data["items"]) == 2


@pytest.mark.asyncio
async def test_get_single_post(client: AsyncClient, test_user_data: dict):
    """Test getting a single post."""
    token = await create_user_and_login(client, test_user_data)
    
    # Create a post
    create_response = await client.post(
        "/api/v1/posts",
        json={"content": "A specific post"},
        headers={"Authorization": f"Bearer {token}"}
    )
    post_id = create_response.json()["id"]
    
    # Get the post
    response = await client.get(f"/api/v1/posts/{post_id}")
    
    assert response.status_code == 200
    assert response.json()["content"] == "A specific post"


@pytest.mark.asyncio
async def test_update_post(client: AsyncClient, test_user_data: dict):
    """Test updating a post."""
    token = await create_user_and_login(client, test_user_data)
    
    # Create a post
    create_response = await client.post(
        "/api/v1/posts",
        json={"content": "Original content"},
        headers={"Authorization": f"Bearer {token}"}
    )
    post_id = create_response.json()["id"]
    
    # Update the post
    response = await client.put(
        f"/api/v1/posts/{post_id}",
        json={"content": "Updated content"},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    assert response.json()["content"] == "Updated content"


@pytest.mark.asyncio
async def test_update_others_post_forbidden(client: AsyncClient, test_user_data: dict, test_user_data_2: dict):
    """Test that updating another user's post is forbidden."""
    token1 = await create_user_and_login(client, test_user_data)
    token2 = await create_user_and_login(client, test_user_data_2)
    
    # User 1 creates a post
    create_response = await client.post(
        "/api/v1/posts",
        json={"content": "User 1's post"},
        headers={"Authorization": f"Bearer {token1}"}
    )
    post_id = create_response.json()["id"]
    
    # User 2 tries to update it
    response = await client.put(
        f"/api/v1/posts/{post_id}",
        json={"content": "Hacked!"},
        headers={"Authorization": f"Bearer {token2}"}
    )
    
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_delete_post(client: AsyncClient, test_user_data: dict):
    """Test deleting a post."""
    token = await create_user_and_login(client, test_user_data)
    
    # Create a post
    create_response = await client.post(
        "/api/v1/posts",
        json={"content": "To be deleted"},
        headers={"Authorization": f"Bearer {token}"}
    )
    post_id = create_response.json()["id"]
    
    # Delete the post
    response = await client.delete(
        f"/api/v1/posts/{post_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 204
    
    # Verify it's deleted
    get_response = await client.get(f"/api/v1/posts/{post_id}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_like_post(client: AsyncClient, test_user_data: dict):
    """Test liking a post."""
    token = await create_user_and_login(client, test_user_data)
    
    # Create a post
    create_response = await client.post(
        "/api/v1/posts",
        json={"content": "Like me!"},
        headers={"Authorization": f"Bearer {token}"}
    )
    post_id = create_response.json()["id"]
    
    # Like the post
    response = await client.post(
        f"/api/v1/posts/{post_id}/like",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    assert response.json()["likes_count"] == 1
    assert "liked" in response.json()["message"].lower()


@pytest.mark.asyncio
async def test_unlike_post(client: AsyncClient, test_user_data: dict):
    """Test unliking a post."""
    token = await create_user_and_login(client, test_user_data)
    
    # Create and like a post
    create_response = await client.post(
        "/api/v1/posts",
        json={"content": "Like then unlike me!"},
        headers={"Authorization": f"Bearer {token}"}
    )
    post_id = create_response.json()["id"]
    
    await client.post(
        f"/api/v1/posts/{post_id}/like",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Unlike the post
    response = await client.delete(
        f"/api/v1/posts/{post_id}/like",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    assert response.json()["likes_count"] == 0


@pytest.mark.asyncio
async def test_double_like_fails(client: AsyncClient, test_user_data: dict):
    """Test that liking a post twice fails."""
    token = await create_user_and_login(client, test_user_data)
    
    # Create a post
    create_response = await client.post(
        "/api/v1/posts",
        json={"content": "Double like test"},
        headers={"Authorization": f"Bearer {token}"}
    )
    post_id = create_response.json()["id"]
    
    # Like once
    await client.post(
        f"/api/v1/posts/{post_id}/like",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Try to like again
    response = await client.post(
        f"/api/v1/posts/{post_id}/like",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_create_comment(client: AsyncClient, test_user_data: dict):
    """Test creating a comment."""
    token = await create_user_and_login(client, test_user_data)
    
    # Create a post
    create_response = await client.post(
        "/api/v1/posts",
        json={"content": "Comment on me!"},
        headers={"Authorization": f"Bearer {token}"}
    )
    post_id = create_response.json()["id"]
    
    # Create a comment
    response = await client.post(
        f"/api/v1/posts/{post_id}/comments",
        json={"content": "Great post!"},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["content"] == "Great post!"
    assert data["post_id"] == post_id


@pytest.mark.asyncio
async def test_get_comments(client: AsyncClient, test_user_data: dict):
    """Test getting comments for a post."""
    token = await create_user_and_login(client, test_user_data)
    
    # Create a post
    create_response = await client.post(
        "/api/v1/posts",
        json={"content": "Post with comments"},
        headers={"Authorization": f"Bearer {token}"}
    )
    post_id = create_response.json()["id"]
    
    # Create comments
    for i in range(3):
        await client.post(
            f"/api/v1/posts/{post_id}/comments",
            json={"content": f"Comment {i+1}"},
            headers={"Authorization": f"Bearer {token}"}
        )
    
    # Get comments
    response = await client.get(f"/api/v1/posts/{post_id}/comments")
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert len(data["items"]) == 3


@pytest.mark.asyncio
async def test_delete_comment(client: AsyncClient, test_user_data: dict):
    """Test deleting a comment."""
    token = await create_user_and_login(client, test_user_data)
    
    # Create a post
    create_response = await client.post(
        "/api/v1/posts",
        json={"content": "Post for comment deletion"},
        headers={"Authorization": f"Bearer {token}"}
    )
    post_id = create_response.json()["id"]
    
    # Create a comment
    comment_response = await client.post(
        f"/api/v1/posts/{post_id}/comments",
        json={"content": "To be deleted"},
        headers={"Authorization": f"Bearer {token}"}
    )
    comment_id = comment_response.json()["id"]
    
    # Delete the comment
    response = await client.delete(
        f"/api/v1/posts/{post_id}/comments/{comment_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 204


@pytest.mark.asyncio
async def test_post_not_found(client: AsyncClient, test_user_data: dict):
    """Test getting a non-existent post."""
    response = await client.get("/api/v1/posts/99999")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_report(client: AsyncClient, test_user_data: dict):
    """Test reporting a post."""
    token = await create_user_and_login(client, test_user_data)
    
    # Create a post
    create_response = await client.post(
        "/api/v1/posts",
        json={"content": "Reportable content"},
        headers={"Authorization": f"Bearer {token}"}
    )
    post_id = create_response.json()["id"]
    
    # Report the post
    response = await client.post(
        "/api/v1/reports",
        json={
            "post_id": post_id,
            "reason": "This content violates community guidelines and should be reviewed."
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["post_id"] == post_id
    assert data["status"] == "pending"

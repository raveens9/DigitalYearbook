# Digital Yearbook - Backend

FastAPI backend for the Digital Yearbook application.

## Tech Stack

- FastAPI
- SQLAlchemy 2.0 (async)
- Alembic (migrations)
- PostgreSQL (Neon)
- JWT Authentication
- Pydantic v2

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL database (or Neon account)

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your database credentials
```

### Database Setup

```bash
# Run migrations
alembic upgrade head
```

### Development

```bash
# Start development server
uvicorn app.main:app --reload --port 8000
```

The API will be available at http://localhost:8000

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Testing

```bash
# Run tests
pytest -v
```

## Project Structure

```
app/
├── api/
│   └── v1/
│       ├── endpoints/     # API route handlers
│       │   ├── auth.py
│       │   ├── comments.py
│       │   ├── posts.py
│       │   ├── reports.py
│       │   ├── search.py
│       │   └── users.py
│       └── router.py      # API router
├── core/
│   ├── config.py          # Settings
│   ├── deps.py            # Dependencies
│   └── security.py        # JWT/password utils
├── db/
│   ├── base.py            # SQLAlchemy base
│   └── session.py         # Database session
├── models/                # SQLAlchemy models
│   ├── comment.py
│   ├── like.py
│   ├── post.py
│   ├── refresh_token.py
│   ├── report.py
│   └── user.py
├── schemas/               # Pydantic schemas
│   ├── auth.py
│   ├── comment.py
│   ├── common.py
│   ├── post.py
│   ├── report.py
│   └── user.py
├── services/              # Business logic
│   ├── auth.py
│   ├── comment.py
│   ├── post.py
│   ├── report.py
│   └── user.py
└── main.py                # Application entry
```

## API Endpoints

All endpoints are prefixed with `/api/v1`

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh tokens
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### Users

- `GET /users/me` - Get own profile
- `PUT /users/me` - Update own profile
- `GET /users/{id}` - Get user by ID
- `GET /users/username/{username}` - Get user by username
- `GET /users/search` - Search users

### Posts

- `GET /posts` - Get feed
- `GET /posts/recent` - Get recent posts
- `GET /posts/{id}` - Get post
- `GET /posts/user/{id}` - Get user's posts
- `POST /posts` - Create post
- `PUT /posts/{id}` - Update post
- `DELETE /posts/{id}` - Delete post
- `POST /posts/{id}/like` - Like post
- `DELETE /posts/{id}/like` - Unlike post

### Comments

- `GET /posts/{id}/comments` - Get comments
- `POST /posts/{id}/comments` - Create comment
- `PUT /posts/{id}/comments/{cid}` - Update comment
- `DELETE /posts/{id}/comments/{cid}` - Delete comment

### Search

- `GET /search/students` - Search students

### Reports

- `POST /reports` - Create report

## Environment Variables

| Variable                    | Description                          |
| --------------------------- | ------------------------------------ |
| DATABASE_URL                | PostgreSQL connection string         |
| SECRET_KEY                  | JWT signing key                      |
| ACCESS_TOKEN_EXPIRE_MINUTES | Access token TTL (default: 30)       |
| REFRESH_TOKEN_EXPIRE_DAYS   | Refresh token TTL (default: 7)       |
| CORS_ORIGINS                | Allowed origins (comma-separated)    |
| ENV                         | Environment (development/production) |

# Digital Yearbook - MVP

A web application connecting university students through a digital yearbook platform.

## Tech Stack

- **Frontend**: React (Vite) + TypeScript
- **Backend**: FastAPI (Python)
- **Database**: Neon Postgres (PostgreSQL)
- **Auth**: JWT with access/refresh tokens
- **ORM**: SQLAlchemy 2.0 (async) + Alembic

## Project Structure

```
├── backend/          # FastAPI backend
├── frontend/         # React frontend
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (or Neon Postgres account)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env

# Start development server
npm run dev
```

## API Documentation

Once the backend is running, visit:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

### Backend (.env)

| Variable                    | Description                       | Example                                |
| --------------------------- | --------------------------------- | -------------------------------------- |
| DATABASE_URL                | Neon Postgres connection string   | postgresql+asyncpg://user:pass@host/db |
| SECRET_KEY                  | JWT signing key (min 32 chars)    | your-super-secret-key-here             |
| ACCESS_TOKEN_EXPIRE_MINUTES | Access token TTL                  | 30                                     |
| REFRESH_TOKEN_EXPIRE_DAYS   | Refresh token TTL                 | 7                                      |
| CORS_ORIGINS                | Allowed origins (comma-separated) | http://localhost:5173                  |

### Frontend (.env)

| Variable     | Description          | Example               |
| ------------ | -------------------- | --------------------- |
| VITE_API_URL | Backend API base URL | http://localhost:8000 |

## Design Decisions

1. **Username generation**: Auto-generated from email prefix on registration; can be updated later.
2. **Token rotation**: Refresh tokens are single-use; new pair issued on refresh.
3. **Pagination**: Uses `limit` and `offset` query parameters (defaults: limit=20, offset=0).
4. **Timestamps**: All timestamps are UTC, server-generated.
5. **Profile pictures**: Stored as URLs (external hosting assumed).
6. **Rate limiting**: Basic stub implementation using slowapi (can be enhanced for production).
7. **Reports**: Stored in database; no admin UI (backend-only for MVP).

## Testing

```bash
cd backend
pytest -v
```

## License

MIT

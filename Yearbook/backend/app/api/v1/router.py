from fastapi import APIRouter

# 1. Add 'translation' to this list
from app.api.v1.endpoints import auth, users, posts, comments, search, reports, translation

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(posts.router)
api_router.include_router(comments.router)
api_router.include_router(search.router)
api_router.include_router(reports.router)

# 2. Register the translation router
api_router.include_router(translation.router, prefix="/tools", tags=["Tools"])
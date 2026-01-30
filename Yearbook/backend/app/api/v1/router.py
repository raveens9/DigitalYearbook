from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, posts, comments, search, reports, upload

api_router = APIRouter(prefix="/api/v1")

@api_router.get("/health")
async def health_check():
    return {"status": "ok", "message": "Backend is running"}

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(posts.router)
api_router.include_router(comments.router)
api_router.include_router(search.router)
api_router.include_router(reports.router)
api_router.include_router(upload.router)

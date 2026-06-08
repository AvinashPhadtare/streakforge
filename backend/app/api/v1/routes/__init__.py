from fastapi import APIRouter
from app.api.v1.routes import auth, tasks, daily, streaks, xp, habits, analytics

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(tasks.router)
api_router.include_router(daily.router)
api_router.include_router(streaks.router)
api_router.include_router(xp.router)
api_router.include_router(habits.router)
api_router.include_router(analytics.router)

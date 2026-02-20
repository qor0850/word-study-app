import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers.words import router as words_router
from app.routers.days import router as days_router

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost").split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="Word Learning API",
    description="Personal English vocabulary service.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(words_router)
app.include_router(days_router)


@app.get("/health")
async def health():
    return {"status": "ok"}

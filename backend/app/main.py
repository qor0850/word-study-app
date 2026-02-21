import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import engine, Base
from app.routers.words import router as words_router
from app.routers.days import router as days_router
from app.routers.personal import router as personal_router

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost").split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        # Create toeic_words, personal_words (and legacy words) tables
        await conn.run_sync(Base.metadata.create_all)

        # ── Legacy migration ────────────────────────────────────────────────
        # If the old 'words' table has rows, copy them into the new tables.
        # ON CONFLICT DO NOTHING makes this safe to run on every startup.
        words_exists = (await conn.execute(text(
            "SELECT EXISTS (SELECT FROM information_schema.tables "
            "WHERE table_schema='public' AND table_name='words')"
        ))).scalar()

        if words_exists:
            # Ensure user_id column exists on legacy table (older installs)
            await conn.execute(text(
                "ALTER TABLE words ADD COLUMN IF NOT EXISTS "
                "user_id INTEGER NOT NULL DEFAULT 0"
            ))

            # TOEIC words (user_id = 0) → toeic_words
            await conn.execute(text("""
                INSERT INTO toeic_words (id, word, meaning, example, study_day, created_at)
                SELECT id, word, meaning, example, COALESCE(study_day, 1), created_at
                FROM words
                WHERE user_id = 0
                ON CONFLICT (id) DO NOTHING
            """))

            # Personal words (user_id > 0) → personal_words
            await conn.execute(text("""
                INSERT INTO personal_words (id, word, meaning, example, study_day, user_id, created_at)
                SELECT id, word, meaning, example, COALESCE(study_day, 1), user_id, created_at
                FROM words
                WHERE user_id > 0
                ON CONFLICT (id) DO NOTHING
            """))
        # ───────────────────────────────────────────────────────────────────

    yield
    await engine.dispose()


app = FastAPI(
    title="Word Learning API",
    description="Personal English vocabulary service.",
    version="3.0.0",
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
app.include_router(personal_router)


@app.get("/health")
async def health():
    return {"status": "ok"}

"""
Migration: Add user_id column to words table.

Existing data is preserved with user_id=0 (TOEIC / shared pool).
Personal users (1-10) use user_id=1..10.

Run manually:
    cd backend
    python -m migrations.add_user_id

Or with a custom DATABASE_URL:
    DATABASE_URL=postgresql+asyncpg://... python -m migrations.add_user_id
"""
import asyncio
import os

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://worduser:wordpass@localhost:5432/worddb",
)


async def run() -> None:
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        print("Adding user_id column to words table (existing rows → user_id=0)…")
        await conn.execute(text(
            "ALTER TABLE words ADD COLUMN IF NOT EXISTS user_id INTEGER NOT NULL DEFAULT 0"
        ))
        print("Creating index on user_id…")
        await conn.execute(text(
            "CREATE INDEX IF NOT EXISTS ix_words_user_id ON words(user_id)"
        ))
        print("Migration complete.")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(run())

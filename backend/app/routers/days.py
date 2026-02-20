import random
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models import Word
from app.schemas import DaySummary, WordRead

router = APIRouter(prefix="/days", tags=["days"])

TOTAL_DAYS = 30


@router.get("", response_model=list[DaySummary])
async def list_days(db: AsyncSession = Depends(get_db)):
    """Return all 30 study days with their word counts."""
    result = await db.execute(
        select(Word.study_day, func.count(Word.id).label("word_count"))
        .group_by(Word.study_day)
    )
    counts = {row.study_day: row.word_count for row in result}
    return [
        DaySummary(day_number=d, word_count=counts.get(d, 0))
        for d in range(1, TOTAL_DAYS + 1)
    ]


@router.get("/{day_number}/words", response_model=list[WordRead])
async def get_day_words(day_number: int, db: AsyncSession = Depends(get_db)):
    """Return all words for a specific study day in random order."""
    result = await db.execute(
        select(Word)
        .where(Word.study_day == day_number)
        .order_by(Word.created_at.asc())
    )
    words = result.scalars().all()
    # Shuffle the words in random order
    random.shuffle(words)
    return words

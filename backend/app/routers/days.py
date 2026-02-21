import random
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models import ToeicWord, PersonalWord
from app.schemas import DaySummary, WordRead

router = APIRouter(prefix="/days", tags=["days"])

TOTAL_DAYS = 30


def _model(user_id: int):
    return PersonalWord if user_id > 0 else ToeicWord


@router.get("", response_model=list[DaySummary])
async def list_days(
    user_id: int = Query(0, ge=0, le=10),
    db: AsyncSession = Depends(get_db),
):
    """Return all 30 study days with their word counts for a given user."""
    Model = _model(user_id)
    query = (
        select(Model.study_day, func.count(Model.id).label("word_count"))
        .group_by(Model.study_day)
    )
    if user_id > 0:
        query = query.where(Model.user_id == user_id)

    result = await db.execute(query)
    counts = {row.study_day: row.word_count for row in result}
    return [
        DaySummary(day_number=d, word_count=counts.get(d, 0))
        for d in range(1, TOTAL_DAYS + 1)
    ]


@router.get("/{day_number}/words", response_model=list[WordRead])
async def get_day_words(
    day_number: int,
    user_id: int = Query(0, ge=0, le=10),
    db: AsyncSession = Depends(get_db),
):
    """Return all words for a specific study day in random order."""
    Model = _model(user_id)
    query = select(Model).where(Model.study_day == day_number)
    if user_id > 0:
        query = query.where(Model.user_id == user_id)

    result = await db.execute(query.order_by(Model.created_at.asc()))
    words = list(result.scalars().all())
    random.shuffle(words)
    return words

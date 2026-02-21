from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models import PersonalWord
from app.schemas import UserSummary

router = APIRouter(prefix="/personal", tags=["personal"])

TOTAL_USERS = 10


@router.get("/summary", response_model=list[UserSummary])
async def get_personal_summary(db: AsyncSession = Depends(get_db)):
    """Return word counts for each personal user (user_id 1-10) from personal_words table."""
    result = await db.execute(
        select(PersonalWord.user_id, func.count(PersonalWord.id).label("word_count"))
        .group_by(PersonalWord.user_id)
    )
    counts = {row.user_id: row.word_count for row in result}
    return [
        UserSummary(user_id=uid, word_count=counts.get(uid, 0))
        for uid in range(1, TOTAL_USERS + 1)
    ]

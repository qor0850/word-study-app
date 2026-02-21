import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func

from app.models import ToeicWord, PersonalWord
from app.schemas import WordCreate, WordUpdate


def _model(user_id: int):
    """Return the correct ORM model based on user_id.
    user_id == 0  → ToeicWord  (toeic_words table)
    user_id 1-10  → PersonalWord (personal_words table)
    """
    return PersonalWord if user_id > 0 else ToeicWord


async def get_words(
    db: AsyncSession,
    search: str | None = None,
    skip: int = 0,
    limit: int = 50,
    day: int | None = None,
    per_day: int = 10,
    user_id: int = 0,
):
    Model = _model(user_id)
    query = select(Model)
    count_query = select(func.count(Model.id))

    if user_id > 0:
        query = query.where(Model.user_id == user_id)
        count_query = count_query.where(Model.user_id == user_id)

    if search:
        pattern = f"%{search}%"
        cond = or_(Model.word.ilike(pattern), Model.meaning.ilike(pattern))
        query = query.where(cond)
        count_query = count_query.where(cond)

    if day is not None and day >= 1:
        query = query.where(Model.study_day == day)
        count_query = count_query.where(Model.study_day == day)

    total = (await db.execute(count_query)).scalar_one()
    result = await db.execute(
        query.order_by(Model.created_at.desc()).offset(skip).limit(limit)
    )
    return result.scalars().all(), total


async def get_word(db: AsyncSession, word_id: uuid.UUID):
    """Search toeic_words first, then personal_words."""
    word = await db.get(ToeicWord, word_id)
    if word is None:
        word = await db.get(PersonalWord, word_id)
    return word


async def create_word(db: AsyncSession, data: WordCreate):
    if data.user_id > 0:
        word = PersonalWord(
            word=data.word,
            meaning=data.meaning,
            example=data.example,
            study_day=data.study_day or 1,
            user_id=data.user_id,
        )
    else:
        word = ToeicWord(
            word=data.word,
            meaning=data.meaning,
            example=data.example,
            study_day=data.study_day or 1,
        )
    db.add(word)
    await db.flush()
    await db.refresh(word)
    return word


async def update_word(db: AsyncSession, word, data: WordUpdate):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(word, field, value)
    await db.flush()
    await db.refresh(word)
    return word


async def delete_word(db: AsyncSession, word) -> None:
    await db.delete(word)

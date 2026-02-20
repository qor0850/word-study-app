import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func

from app.models import Word
from app.schemas import WordCreate, WordUpdate


async def get_words(
    db: AsyncSession,
    search: str | None = None,
    skip: int = 0,
    limit: int = 50,
    day: int | None = None,
    per_day: int = 10,
) -> tuple[list[Word], int]:
    query = select(Word)
    count_query = select(func.count(Word.id))

    if search:
        pattern = f"%{search}%"
        cond = or_(Word.word.ilike(pattern), Word.meaning.ilike(pattern))
        query = query.where(cond)
        count_query = count_query.where(cond)

    # If day filter provided, filter by study_day
    if day is not None and day >= 1:
        query = query.where(Word.study_day == day)
        count_query = count_query.where(Word.study_day == day)

    total = (await db.execute(count_query)).scalar_one()

    result = await db.execute(
        query.order_by(Word.created_at.desc()).offset(skip).limit(limit)
    )
    return result.scalars().all(), total


async def get_word(db: AsyncSession, word_id: uuid.UUID) -> Word | None:
    return await db.get(Word, word_id)


async def create_word(db: AsyncSession, data: WordCreate) -> Word:
    word = Word(**data.model_dump())
    db.add(word)
    await db.flush()
    await db.refresh(word)
    return word


async def update_word(db: AsyncSession, word: Word, data: WordUpdate) -> Word:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(word, field, value)
    await db.flush()
    await db.refresh(word)
    return word


async def delete_word(db: AsyncSession, word: Word) -> None:
    await db.delete(word)

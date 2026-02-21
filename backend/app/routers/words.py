import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import WordCreate, WordUpdate, WordRead
from app.services import word_service

router = APIRouter(prefix="/words", tags=["words"])


@router.get("", response_model=list[WordRead])
async def list_words(
    search: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    day: int | None = Query(None, ge=1),
    per_day: int = Query(10, ge=1, le=100),
    user_id: int = Query(0, ge=0, le=10),
    db: AsyncSession = Depends(get_db),
):
    words, _ = await word_service.get_words(
        db, search=search, skip=skip, limit=limit, day=day, per_day=per_day, user_id=user_id
    )
    return words


@router.post("", response_model=WordRead, status_code=201)
async def create_word(
    payload: WordCreate,
    db: AsyncSession = Depends(get_db),
):
    return await word_service.create_word(db, payload)


@router.get("/{word_id}", response_model=WordRead)
async def get_word(word_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    word = await word_service.get_word(db, word_id)
    if not word:
        raise HTTPException(status_code=404, detail="Word not found.")
    return word


@router.put("/{word_id}", response_model=WordRead)
async def update_word(
    word_id: uuid.UUID,
    payload: WordUpdate,
    db: AsyncSession = Depends(get_db),
):
    word = await word_service.get_word(db, word_id)
    if not word:
        raise HTTPException(status_code=404, detail="Word not found.")
    return await word_service.update_word(db, word, payload)


@router.delete("/{word_id}", status_code=204)
async def delete_word(
    word_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    word = await word_service.get_word(db, word_id)
    if not word:
        raise HTTPException(status_code=404, detail="Word not found.")
    await word_service.delete_word(db, word)

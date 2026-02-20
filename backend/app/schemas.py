import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class WordCreate(BaseModel):
    word: str = Field(..., min_length=1, max_length=255)
    meaning: str = Field(..., min_length=1)
    example: str | None = None
    study_day: int | None = None


class WordUpdate(BaseModel):
    word: str | None = Field(None, min_length=1, max_length=255)
    meaning: str | None = Field(None, min_length=1)
    example: str | None = None
    study_day: int | None = None


class WordRead(BaseModel):
    id: uuid.UUID
    word: str
    meaning: str
    example: str | None
    study_day: int
    created_at: datetime

    model_config = {"from_attributes": True}


class DaySummary(BaseModel):
    day_number: int
    word_count: int

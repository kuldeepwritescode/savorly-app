from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.post import CategoryEnum


class PostCreate(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    category: CategoryEnum = CategoryEnum.OTHER


class PostUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[CategoryEnum] = None


class PostResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    category: CategoryEnum
    owner_id: int
    owner_username: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
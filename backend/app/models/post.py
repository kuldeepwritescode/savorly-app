from __future__ import annotations

from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
import enum

from app.database.session import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.like import Like
    from app.models.comment import Comment


class CategoryEnum(str, enum.Enum):
    VEG = "veg"
    NON_VEG = "non_veg"
    DESSERT = "dessert"
    OTHER = "other"


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    category: Mapped[CategoryEnum] = mapped_column(Enum(CategoryEnum), default=CategoryEnum.OTHER)

    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="posts")
    likes: Mapped[List["Like"]] = relationship(
        "Like", back_populates="post", cascade="all, delete-orphan"
    )
    comments: Mapped[List["Comment"]] = relationship(
        "Comment", back_populates="post", cascade="all, delete-orphan"
    )
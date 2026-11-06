from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import os
import uuid
import shutil

from app.database.session import get_db
from app.models.user import User
from app.models.post import Post
from app.schemas.user import UserResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None


@router.get("/me/profile", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me/profile", response_model=UserResponse)
def update_my_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_data.phone and user_data.phone != current_user.phone:
        existing = db.query(User).filter(User.phone == user_data.phone).first()
        if existing:
            raise HTTPException(status_code=400, detail="Phone number already registered")

    if user_data.full_name is not None:
        current_user.full_name = user_data.full_name
    if user_data.age is not None:
        current_user.age = user_data.age
    if user_data.address is not None:
        current_user.address = user_data.address
    if user_data.city is not None:
        current_user.city = user_data.city
    if user_data.country is not None:
        current_user.country = user_data.country
    if user_data.gender is not None:
        current_user.gender = user_data.gender
    if user_data.phone is not None:
        current_user.phone = user_data.phone

    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/{username}")
def get_user_profile(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    posts = db.query(Post).filter(Post.owner_id == user.id).order_by(Post.created_at.desc()).all()

    posts_data = []
    for post in posts:
        posts_data.append({
            "id": post.id,
            "title": post.title,
            "description": post.description,
            "image_url": post.image_url,
            "category": post.category,
            "owner_id": post.owner_id,
            "owner_username": user.username,
            "created_at": post.created_at,
            "updated_at": post.updated_at,
        })

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "age": user.age,
            "address": user.address,
            "city": user.city,
            "country": user.country,
            "gender": user.gender,
            "phone": user.phone,
            "profile_image": user.profile_image,
            "created_at": user.created_at,
        },
        "posts": posts_data,
        "total_posts": len(posts_data),
    }


@router.post("/upload-profile-image")
async def upload_profile_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    file_extension = file.filename.split(".")[-1]
    unique_filename = f"profile_{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_url = f"http://127.0.0.1:8000/uploads/{unique_filename}"
    current_user.profile_image = image_url
    db.commit()
    db.refresh(current_user)

    return {"profile_image": image_url}
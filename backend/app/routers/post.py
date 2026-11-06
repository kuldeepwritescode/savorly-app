from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
import shutil

from app.database.session import get_db
from app.models.user import User
from app.models.post import Post
from app.models.like import Like
from app.models.comment import Comment
from app.schemas.post import PostCreate, PostResponse
from app.schemas.comment import CommentCreate, CommentResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/posts", tags=["Posts"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_url = f"http://127.0.0.1:8000/uploads/{unique_filename}"
    return {"image_url": image_url}


@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    post_data: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_post = Post(
        title=post_data.title,
        description=post_data.description,
        image_url=post_data.image_url,
        category=post_data.category,
        owner_id=current_user.id
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post


from fastapi import Query

@router.get("/", response_model=List[PostResponse])
def get_all_posts(
    search: str = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Post)

    if search:
        query = query.filter(Post.title.ilike(f"%{search}%"))

    posts = query.order_by(Post.created_at.desc()).all()

    result = []
    for post in posts:
        result.append(PostResponse(
            id=post.id,
            title=post.title,
            description=post.description,
            image_url=post.image_url,
            category=post.category,
            owner_id=post.owner_id,
            owner_username=post.owner.username if post.owner else None,
            created_at=post.created_at,
            updated_at=post.updated_at,
        ))
    return result

@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.put("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: int,
    post_data: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")

    post.title = post_data.title
    post.description = post_data.description
    post.image_url = post_data.image_url
    post.category = post_data.category
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    db.query(Like).filter(Like.post_id == post_id).delete()
    db.query(Comment).filter(Comment.post_id == post_id).delete()
    db.delete(post)
    db.commit()
    return None


# ==================== LIKES ====================

@router.post("/{post_id}/like")
def like_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = db.query(Like).filter(Like.post_id == post_id, Like.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already liked")

    db.add(Like(user_id=current_user.id, post_id=post_id))
    db.commit()
    return {"message": "Post liked"}


@router.delete("/{post_id}/like")
def unlike_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    like = db.query(Like).filter(Like.post_id == post_id, Like.user_id == current_user.id).first()
    if not like:
        raise HTTPException(status_code=404, detail="Like not found")
    db.delete(like)
    db.commit()
    return {"message": "Post unliked"}


@router.get("/{post_id}/likes")
def get_post_likes(post_id: int, db: Session = Depends(get_db)):
    count = db.query(Like).filter(Like.post_id == post_id).count()
    return {"likes_count": count}


# ==================== COMMENTS ====================

@router.get("/{post_id}/comments")
def get_comments(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.asc()).all()
    result = []
    for c in comments:
        result.append({
            "id": c.id,
            "content": c.content,
            "user_id": c.user_id,
            "post_id": c.post_id,
            "username": c.user.username if c.user else "unknown",
            "created_at": c.created_at,
            "updated_at": c.updated_at,
        })
    return result


@router.post("/{post_id}/comments", status_code=status.HTTP_201_CREATED)
def create_comment(
    post_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    new_comment = Comment(
        content=comment_data.content,
        user_id=current_user.id,
        post_id=post_id,
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return {
        "id": new_comment.id,
        "content": new_comment.content,
        "user_id": new_comment.user_id,
        "post_id": new_comment.post_id,
        "username": current_user.username,
        "created_at": new_comment.created_at,
        "updated_at": new_comment.updated_at,
    }


@router.delete("/{post_id}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    post_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.post_id == post_id
    ).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Post owner YA comment owner delete kar sakta hai
    is_post_owner = post.owner_id == current_user.id
    is_comment_owner = comment.user_id == current_user.id

    if not (is_post_owner or is_comment_owner):
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    db.delete(comment)
    db.commit()
    return None
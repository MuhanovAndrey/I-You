from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import models
import schemas
from database import get_db
from auth import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.Post)
def create_post(post: schemas.PostCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_post = models.Post(
        title=post.title,
        content=post.content,
        author_id=current_user.id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
    # Add counts
    db_post.reactions_count = {}
    db_post.comments_count = 0
    
    return db_post

@router.get("/", response_model=List[schemas.Post])
def get_posts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    posts = db.query(models.Post).order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add reaction counts and comment counts for each post
    for post in posts:
        reactions = db.query(
            models.Reaction.reaction_type,
            func.count(models.Reaction.id)
        ).filter(models.Reaction.post_id == post.id).group_by(models.Reaction.reaction_type).all()
        
        post.reactions_count = {str(r[0].value): r[1] for r in reactions}
        post.comments_count = db.query(models.Comment).filter(models.Comment.post_id == post.id).count()
    
    return posts

@router.get("/{post_id}", response_model=schemas.Post)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Add reaction counts and comment count
    reactions = db.query(
        models.Reaction.reaction_type,
        func.count(models.Reaction.id)
    ).filter(models.Reaction.post_id == post.id).group_by(models.Reaction.reaction_type).all()
    
    post.reactions_count = {str(r[0].value): r[1] for r in reactions}
    post.comments_count = db.query(models.Comment).filter(models.Comment.post_id == post.id).count()
    
    return post

@router.delete("/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully"}

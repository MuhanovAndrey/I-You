from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db
from auth import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.Reaction)
def create_reaction(reaction: schemas.ReactionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check if post exists
    post = db.query(models.Post).filter(models.Post.id == reaction.post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if user already reacted to this post
    existing_reaction = db.query(models.Reaction).filter(
        models.Reaction.post_id == reaction.post_id,
        models.Reaction.user_id == current_user.id
    ).first()
    
    if existing_reaction:
        # Update existing reaction
        existing_reaction.reaction_type = models.ReactionType[reaction.reaction_type.value.upper()]
        db.commit()
        db.refresh(existing_reaction)
        return existing_reaction
    else:
        # Create new reaction
        db_reaction = models.Reaction(
            post_id=reaction.post_id,
            user_id=current_user.id,
            reaction_type=models.ReactionType[reaction.reaction_type.value.upper()]
        )
        db.add(db_reaction)
        db.commit()
        db.refresh(db_reaction)
        return db_reaction

@router.delete("/{post_id}")
def delete_reaction(post_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    reaction = db.query(models.Reaction).filter(
        models.Reaction.post_id == post_id,
        models.Reaction.user_id == current_user.id
    ).first()
    
    if not reaction:
        raise HTTPException(status_code=404, detail="Reaction not found")
    
    db.delete(reaction)
    db.commit()
    return {"message": "Reaction removed successfully"}

@router.get("/{post_id}", response_model=List[schemas.Reaction])
def get_post_reactions(post_id: int, db: Session = Depends(get_db)):
    reactions = db.query(models.Reaction).filter(models.Reaction.post_id == post_id).all()
    return reactions

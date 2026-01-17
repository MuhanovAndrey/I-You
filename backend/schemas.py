from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from enum import Enum

class ReactionTypeEnum(str, Enum):
    HEART = "heart"
    LIKE = "like"
    LOVE = "love"
    SMILE = "smile"
    SAD = "sad"

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Post schemas
class PostBase(BaseModel):
    title: str
    content: str

class PostCreate(PostBase):
    pass

class Post(PostBase):
    id: int
    author_id: int
    created_at: datetime
    updated_at: datetime
    author: User
    reactions_count: Optional[dict] = {}
    comments_count: Optional[int] = 0

    class Config:
        from_attributes = True

# Reaction schemas
class ReactionCreate(BaseModel):
    post_id: int
    reaction_type: ReactionTypeEnum

class Reaction(BaseModel):
    id: int
    post_id: int
    user_id: int
    reaction_type: ReactionTypeEnum
    created_at: datetime

    class Config:
        from_attributes = True

# Comment schemas
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    post_id: int

class Comment(CommentBase):
    id: int
    post_id: int
    author_id: int
    created_at: datetime
    updated_at: datetime
    author: User

    class Config:
        from_attributes = True

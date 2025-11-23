from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    research_interests: Optional[List[str]] = None


class UserResponse(UserBase):
    id: int
    bio: Optional[str] = None
    research_interests: Optional[List[str]] = None
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfile(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    bio: Optional[str] = None
    research_interests: Optional[List[str]] = None
    followers_count: int = 0
    following_count: int = 0
    saved_papers_count: int = 0
    is_following: bool = False

    class Config:
        from_attributes = True

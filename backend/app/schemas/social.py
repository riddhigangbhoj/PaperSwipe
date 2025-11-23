from pydantic import BaseModel
from typing import List
from datetime import datetime
from .user import UserProfile


class FollowResponse(BaseModel):
    id: int
    follower_id: int
    following_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class FollowersResponse(BaseModel):
    followers: List[UserProfile]
    total: int


class FollowingResponse(BaseModel):
    following: List[UserProfile]
    total: int


class TrendingPaper(BaseModel):
    arxiv_id: str
    title: str
    authors: List[str]
    abstract: str
    categories: List[str]
    published_date: str
    pdf_url: str
    source_url: str
    save_count: int
    recent_saves: int  # Saves in last 7 days


class FeedItem(BaseModel):
    user: UserProfile
    paper: dict
    action: str  # 'saved', 'liked'
    created_at: datetime

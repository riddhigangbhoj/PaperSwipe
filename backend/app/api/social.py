from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
import json
from datetime import datetime, timedelta
from ..database import get_db
from ..models import User, SavedPaper, Follow
from ..schemas import (
    UserProfile,
    FollowersResponse,
    FollowingResponse,
    TrendingPaper,
    FeedItem
)
from ..core import get_current_active_user, get_optional_user

router = APIRouter(prefix="/social", tags=["social"])


@router.get("/profile/{user_id}", response_model=UserProfile)
async def get_user_profile(
    user_id: int,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Get user profile"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get counts
    followers_count = db.query(Follow).filter(Follow.following_id == user_id).count()
    following_count = db.query(Follow).filter(Follow.follower_id == user_id).count()
    saved_papers_count = db.query(SavedPaper).filter(SavedPaper.user_id == user_id).count()

    # Check if current user is following this user
    is_following = False
    if current_user:
        is_following = db.query(Follow).filter(
            Follow.follower_id == current_user.id,
            Follow.following_id == user_id
        ).first() is not None

    # Parse research interests
    research_interests = None
    if user.research_interests:
        try:
            research_interests = json.loads(user.research_interests)
        except:
            research_interests = []

    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "bio": user.bio,
        "research_interests": research_interests,
        "followers_count": followers_count,
        "following_count": following_count,
        "saved_papers_count": saved_papers_count,
        "is_following": is_following
    }


@router.post("/follow/{user_id}")
async def follow_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Follow a user"""
    # Can't follow yourself
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot follow yourself"
        )

    # Check if user exists
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if already following
    existing = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.following_id == user_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already following this user"
        )

    # Create follow relationship
    new_follow = Follow(
        follower_id=current_user.id,
        following_id=user_id
    )
    db.add(new_follow)
    db.commit()

    return {"message": "Successfully followed user"}


@router.delete("/follow/{user_id}")
async def unfollow_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Unfollow a user"""
    follow = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.following_id == user_id
    ).first()

    if not follow:
        raise HTTPException(status_code=404, detail="Not following this user")

    db.delete(follow)
    db.commit()

    return {"message": "Successfully unfollowed user"}


@router.get("/followers", response_model=FollowersResponse)
async def get_followers(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get list of followers"""
    follows = db.query(Follow).filter(Follow.following_id == current_user.id).all()

    followers = []
    for follow in follows:
        user = follow.follower
        followers.append({
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "bio": user.bio,
            "research_interests": json.loads(user.research_interests) if user.research_interests else [],
            "followers_count": db.query(Follow).filter(Follow.following_id == user.id).count(),
            "following_count": db.query(Follow).filter(Follow.follower_id == user.id).count(),
            "saved_papers_count": db.query(SavedPaper).filter(SavedPaper.user_id == user.id).count(),
            "is_following": True
        })

    return {"followers": followers, "total": len(followers)}


@router.get("/following", response_model=FollowingResponse)
async def get_following(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get list of users being followed"""
    follows = db.query(Follow).filter(Follow.follower_id == current_user.id).all()

    following = []
    for follow in follows:
        user = follow.following
        following.append({
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "bio": user.bio,
            "research_interests": json.loads(user.research_interests) if user.research_interests else [],
            "followers_count": db.query(Follow).filter(Follow.following_id == user.id).count(),
            "following_count": db.query(Follow).filter(Follow.follower_id == user.id).count(),
            "saved_papers_count": db.query(SavedPaper).filter(SavedPaper.user_id == user.id).count(),
            "is_following": True
        })

    return {"following": following, "total": len(following)}


@router.get("/trending", response_model=List[TrendingPaper])
async def get_trending_papers(
    days: int = Query(7, ge=1, le=30, description="Number of days to look back"),
    limit: int = Query(10, ge=1, le=50, description="Number of papers to return"),
    db: Session = Depends(get_db)
):
    """Get trending papers based on saves"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)

    # Query for most saved papers
    trending = db.query(
        SavedPaper.arxiv_id,
        SavedPaper.title,
        SavedPaper.authors,
        SavedPaper.abstract,
        SavedPaper.categories,
        SavedPaper.published_date,
        SavedPaper.pdf_url,
        SavedPaper.source_url,
        func.count(SavedPaper.arxiv_id).label('total_saves'),
        func.sum(func.case([(SavedPaper.saved_at >= cutoff_date, 1)], else_=0)).label('recent_saves')
    ).filter(
        SavedPaper.is_public == 1
    ).group_by(
        SavedPaper.arxiv_id,
        SavedPaper.title,
        SavedPaper.authors,
        SavedPaper.abstract,
        SavedPaper.categories,
        SavedPaper.published_date,
        SavedPaper.pdf_url,
        SavedPaper.source_url
    ).order_by(
        desc('recent_saves')
    ).limit(limit).all()

    result = []
    for paper in trending:
        result.append({
            "arxiv_id": paper.arxiv_id,
            "title": paper.title,
            "authors": json.loads(paper.authors),
            "abstract": paper.abstract,
            "categories": json.loads(paper.categories),
            "published_date": paper.published_date,
            "pdf_url": paper.pdf_url,
            "source_url": paper.source_url,
            "save_count": paper.total_saves,
            "recent_saves": paper.recent_saves
        })

    return result


@router.get("/feed")
async def get_feed(
    limit: int = Query(20, ge=1, le=100, description="Number of items to return"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get activity feed from followed users"""
    # Get followed user IDs
    following_ids = db.query(Follow.following_id).filter(
        Follow.follower_id == current_user.id
    ).all()
    following_ids = [uid[0] for uid in following_ids]

    if not following_ids:
        return []

    # Get recent saves from followed users
    recent_saves = db.query(SavedPaper).filter(
        SavedPaper.user_id.in_(following_ids),
        SavedPaper.is_public == 1
    ).order_by(
        SavedPaper.saved_at.desc()
    ).limit(limit).all()

    feed = []
    for save in recent_saves:
        user = db.query(User).filter(User.id == save.user_id).first()
        feed.append({
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "bio": user.bio,
                "research_interests": json.loads(user.research_interests) if user.research_interests else [],
                "followers_count": 0,
                "following_count": 0,
                "saved_papers_count": 0,
                "is_following": True
            },
            "paper": {
                "id": save.id,
                "arxiv_id": save.arxiv_id,
                "title": save.title,
                "authors": json.loads(save.authors),
                "abstract": save.abstract,
                "categories": json.loads(save.categories),
                "published_date": save.published_date,
                "pdf_url": save.pdf_url,
                "source_url": save.source_url
            },
            "action": "saved",
            "created_at": save.saved_at
        })

    return feed

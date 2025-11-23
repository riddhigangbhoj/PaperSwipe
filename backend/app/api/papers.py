from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, PaperInteraction
from ..schemas import PaperResponse, SearchFilters, PaperInteractionCreate
from ..core import arxiv_client, get_current_active_user, get_optional_user

router = APIRouter(prefix="/papers", tags=["papers"])


@router.get("/search", response_model=List[PaperResponse])
async def search_papers(
    query: Optional[str] = Query(None, description="Search query"),
    categories: Optional[str] = Query(None, description="Comma-separated list of categories"),
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    sort_by: str = Query("relevance", description="Sort by: relevance, date, updated"),
    max_results: int = Query(20, ge=1, le=100, description="Maximum number of results"),
    start: int = Query(0, ge=0, description="Pagination start index"),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Search papers from arXiv API with filters
    Works for both authenticated and non-authenticated users
    """
    # Parse categories
    category_list = None
    if categories:
        category_list = [cat.strip() for cat in categories.split(',')]

    # Fetch papers from arXiv
    papers = await arxiv_client.search_papers(
        query=query,
        categories=category_list,
        max_results=max_results,
        start=start,
        date_from=date_from,
        date_to=date_to,
        sort_by=sort_by
    )

    # If user is authenticated, filter out papers they've already interacted with
    if current_user:
        # Get user's seen paper IDs
        seen_interactions = db.query(PaperInteraction.arxiv_id).filter(
            PaperInteraction.user_id == current_user.id
        ).all()
        seen_ids = set([interaction.arxiv_id for interaction in seen_interactions])

        # Filter out seen papers
        papers = [paper for paper in papers if paper['arxiv_id'] not in seen_ids]

    return papers


@router.get("/{arxiv_id}", response_model=PaperResponse)
async def get_paper(arxiv_id: str):
    """Get a specific paper by arXiv ID"""
    paper = await arxiv_client.get_paper_by_id(arxiv_id)
    if not paper:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper


@router.post("/interaction")
async def record_interaction(
    interaction: PaperInteractionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Record user interaction with a paper (view, like, dislike)"""
    new_interaction = PaperInteraction(
        user_id=current_user.id,
        arxiv_id=interaction.arxiv_id,
        interaction_type=interaction.interaction_type
    )
    db.add(new_interaction)
    db.commit()

    return {"message": "Interaction recorded successfully"}

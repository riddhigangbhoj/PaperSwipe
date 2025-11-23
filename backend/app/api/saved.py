from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from typing import List
from sqlalchemy.orm import Session
import json
from ..database import get_db
from ..models import User, SavedPaper, Tag, saved_paper_tags
from ..schemas import (
    SavedPaperCreate,
    SavedPaperUpdate,
    SavedPaperResponse,
    TagCreate,
    TagResponse
)
from ..core import get_current_active_user
from ..utils.export import export_to_bibtex, export_to_csv, export_to_text

router = APIRouter(prefix="/saved", tags=["saved-papers"])


@router.get("/", response_model=List[SavedPaperResponse])
async def get_saved_papers(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all saved papers for the current user"""
    saved_papers = db.query(SavedPaper).filter(
        SavedPaper.user_id == current_user.id
    ).order_by(SavedPaper.saved_at.desc()).all()

    # Format response with tags
    response = []
    for paper in saved_papers:
        paper_dict = {
            "id": paper.id,
            "arxiv_id": paper.arxiv_id,
            "title": paper.title,
            "authors": json.loads(paper.authors),
            "abstract": paper.abstract,
            "categories": json.loads(paper.categories),
            "published_date": paper.published_date,
            "pdf_url": paper.pdf_url,
            "source_url": paper.source_url,
            "notes": paper.notes,
            "tags": [tag.name for tag in paper.tags],
            "is_public": bool(paper.is_public),
            "saved_at": paper.saved_at,
            "updated_at": paper.updated_at
        }
        response.append(paper_dict)

    return response


@router.post("/", response_model=SavedPaperResponse, status_code=status.HTTP_201_CREATED)
async def save_paper(
    paper_data: SavedPaperCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Save a paper to user's collection"""
    # Check if paper already saved
    existing = db.query(SavedPaper).filter(
        SavedPaper.user_id == current_user.id,
        SavedPaper.arxiv_id == paper_data.arxiv_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Paper already saved"
        )

    # Create new saved paper
    new_paper = SavedPaper(
        user_id=current_user.id,
        arxiv_id=paper_data.arxiv_id,
        title=paper_data.title,
        authors=json.dumps(paper_data.authors),
        abstract=paper_data.abstract,
        categories=json.dumps(paper_data.categories),
        published_date=paper_data.published_date,
        pdf_url=paper_data.pdf_url,
        source_url=paper_data.source_url,
        notes=paper_data.notes,
        is_public=1 if paper_data.is_public else 0
    )

    db.add(new_paper)
    db.commit()
    db.refresh(new_paper)

    return {
        "id": new_paper.id,
        "arxiv_id": new_paper.arxiv_id,
        "title": new_paper.title,
        "authors": json.loads(new_paper.authors),
        "abstract": new_paper.abstract,
        "categories": json.loads(new_paper.categories),
        "published_date": new_paper.published_date,
        "pdf_url": new_paper.pdf_url,
        "source_url": new_paper.source_url,
        "notes": new_paper.notes,
        "tags": [],
        "is_public": bool(new_paper.is_public),
        "saved_at": new_paper.saved_at,
        "updated_at": new_paper.updated_at
    }


@router.patch("/{paper_id}", response_model=SavedPaperResponse)
async def update_saved_paper(
    paper_id: int,
    paper_update: SavedPaperUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update notes, tags, or privacy for a saved paper"""
    paper = db.query(SavedPaper).filter(
        SavedPaper.id == paper_id,
        SavedPaper.user_id == current_user.id
    ).first()

    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    # Update fields
    if paper_update.notes is not None:
        paper.notes = paper_update.notes

    if paper_update.is_public is not None:
        paper.is_public = 1 if paper_update.is_public else 0

    # Update tags
    if paper_update.tags is not None:
        # Clear existing tags
        paper.tags = []

        # Add new tags
        for tag_name in paper_update.tags:
            # Find or create tag
            tag = db.query(Tag).filter(
                Tag.user_id == current_user.id,
                Tag.name == tag_name
            ).first()

            if not tag:
                tag = Tag(user_id=current_user.id, name=tag_name)
                db.add(tag)
                db.flush()

            paper.tags.append(tag)

    db.commit()
    db.refresh(paper)

    return {
        "id": paper.id,
        "arxiv_id": paper.arxiv_id,
        "title": paper.title,
        "authors": json.loads(paper.authors),
        "abstract": paper.abstract,
        "categories": json.loads(paper.categories),
        "published_date": paper.published_date,
        "pdf_url": paper.pdf_url,
        "source_url": paper.source_url,
        "notes": paper.notes,
        "tags": [tag.name for tag in paper.tags],
        "is_public": bool(paper.is_public),
        "saved_at": paper.saved_at,
        "updated_at": paper.updated_at
    }


@router.delete("/{paper_id}")
async def delete_saved_paper(
    paper_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Remove a paper from saved collection"""
    paper = db.query(SavedPaper).filter(
        SavedPaper.id == paper_id,
        SavedPaper.user_id == current_user.id
    ).first()

    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    db.delete(paper)
    db.commit()

    return {"message": "Paper removed successfully"}


@router.get("/tags", response_model=List[TagResponse])
async def get_tags(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all tags for the current user"""
    tags = db.query(Tag).filter(Tag.user_id == current_user.id).all()
    return tags


@router.post("/tags", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag_data: TagCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new tag"""
    # Check if tag already exists
    existing = db.query(Tag).filter(
        Tag.user_id == current_user.id,
        Tag.name == tag_data.name
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag already exists"
        )

    new_tag = Tag(
        user_id=current_user.id,
        name=tag_data.name,
        color=tag_data.color
    )

    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)

    return new_tag


@router.delete("/tags/{tag_id}")
async def delete_tag(
    tag_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a tag"""
    tag = db.query(Tag).filter(
        Tag.id == tag_id,
        Tag.user_id == current_user.id
    ).first()

    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    db.delete(tag)
    db.commit()

    return {"message": "Tag deleted successfully"}


@router.get("/export")
async def export_papers(
    format: str = Query(..., description="Export format: bibtex, csv, or text"),
    tag: str = Query(None, description="Filter by tag name"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Export saved papers in various formats (BibTeX, CSV, plain text)"""
    # Get saved papers
    query = db.query(SavedPaper).filter(SavedPaper.user_id == current_user.id)

    # Filter by tag if provided
    if tag:
        query = query.join(SavedPaper.tags).filter(Tag.name == tag)

    papers = query.order_by(SavedPaper.saved_at.desc()).all()

    if not papers:
        raise HTTPException(
            status_code=404,
            detail="No papers found to export"
        )

    # Generate export content based on format
    if format.lower() == "bibtex":
        content = export_to_bibtex(papers)
        media_type = "application/x-bibtex"
        filename = "papers.bib"
    elif format.lower() == "csv":
        content = export_to_csv(papers)
        media_type = "text/csv"
        filename = "papers.csv"
    elif format.lower() == "text":
        content = export_to_text(papers)
        media_type = "text/plain"
        filename = "papers.txt"
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid format. Use 'bibtex', 'csv', or 'text'"
        )

    # Return file download response
    return Response(
        content=content,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

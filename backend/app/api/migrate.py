from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json
from ..database import get_db
from ..models import User, SavedPaper, Tag, PaperInteraction
from ..schemas import MigrationData
from ..core import get_current_active_user

router = APIRouter(prefix="/migrate", tags=["migration"])


@router.post("/import-localstorage")
async def import_localstorage_data(
    migration_data: MigrationData,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Import user data from localStorage to backend database
    This is a one-time migration endpoint for existing users
    """
    imported_count = 0
    skipped_count = 0
    errors = []

    try:
        # Import preferences (seen papers, liked/disliked)
        preferences = migration_data.preferences

        # Record seen paper interactions
        if 'seenPaperIds' in preferences:
            for paper_id in preferences['seenPaperIds']:
                existing = db.query(PaperInteraction).filter(
                    PaperInteraction.user_id == current_user.id,
                    PaperInteraction.arxiv_id == paper_id,
                    PaperInteraction.interaction_type == 'view'
                ).first()

                if not existing:
                    interaction = PaperInteraction(
                        user_id=current_user.id,
                        arxiv_id=paper_id,
                        interaction_type='view'
                    )
                    db.add(interaction)

        # Record disliked papers
        if 'dislikedPaperIds' in preferences:
            for paper_id in preferences['dislikedPaperIds']:
                existing = db.query(PaperInteraction).filter(
                    PaperInteraction.user_id == current_user.id,
                    PaperInteraction.arxiv_id == paper_id,
                    PaperInteraction.interaction_type == 'dislike'
                ).first()

                if not existing:
                    interaction = PaperInteraction(
                        user_id=current_user.id,
                        arxiv_id=paper_id,
                        interaction_type='dislike'
                    )
                    db.add(interaction)

        # Update user preferences (topics, date range)
        if 'selectedTopics' in preferences:
            current_user.research_interests = json.dumps(preferences['selectedTopics'])

        db.commit()

        # Import saved papers
        for paper_data in migration_data.saved_papers:
            try:
                # Check if paper already exists
                existing_paper = db.query(SavedPaper).filter(
                    SavedPaper.user_id == current_user.id,
                    SavedPaper.arxiv_id == paper_data['id']
                ).first()

                if existing_paper:
                    skipped_count += 1
                    continue

                # Create new saved paper
                new_paper = SavedPaper(
                    user_id=current_user.id,
                    arxiv_id=paper_data['id'],
                    title=paper_data['title'],
                    authors=json.dumps(paper_data['authors']),
                    abstract=paper_data['abstract'],
                    categories=json.dumps(paper_data['categories']),
                    published_date=paper_data.get('publishedDate', ''),
                    pdf_url=paper_data.get('pdfUrl'),
                    source_url=paper_data.get('sourceUrl', ''),
                    notes=paper_data.get('notes', ''),
                    is_public=1
                )

                db.add(new_paper)
                db.flush()  # Get the ID without committing

                # Add tags if present
                if 'tags' in paper_data and paper_data['tags']:
                    for tag_name in paper_data['tags']:
                        # Find or create tag
                        tag = db.query(Tag).filter(
                            Tag.user_id == current_user.id,
                            Tag.name == tag_name
                        ).first()

                        if not tag:
                            tag = Tag(user_id=current_user.id, name=tag_name)
                            db.add(tag)
                            db.flush()

                        new_paper.tags.append(tag)

                db.commit()
                imported_count += 1

            except Exception as e:
                db.rollback()
                errors.append(f"Error importing paper {paper_data.get('id', 'unknown')}: {str(e)}")
                continue

        return {
            "message": "Migration completed",
            "imported": imported_count,
            "skipped": skipped_count,
            "errors": errors
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Migration failed: {str(e)}"
        )

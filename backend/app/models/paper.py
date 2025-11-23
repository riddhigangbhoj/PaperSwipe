from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


# Association table for many-to-many relationship between SavedPaper and Tag
saved_paper_tags = Table(
    'saved_paper_tags',
    Base.metadata,
    Column('saved_paper_id', Integer, ForeignKey('saved_papers.id', ondelete='CASCADE')),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete='CASCADE'))
)


class SavedPaper(Base):
    __tablename__ = "saved_papers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Paper metadata (from arXiv)
    arxiv_id = Column(String(100), nullable=False, index=True)
    title = Column(Text, nullable=False)
    authors = Column(Text, nullable=False)  # JSON string array
    abstract = Column(Text, nullable=False)
    categories = Column(Text, nullable=False)  # JSON string array
    published_date = Column(String(50), nullable=False)
    pdf_url = Column(String(500), nullable=True)
    source_url = Column(String(500), nullable=False)

    # User additions
    notes = Column(Text, nullable=True)
    is_liked = Column(Integer, default=1)  # 1 for liked, -1 for disliked

    # Privacy
    is_public = Column(Integer, default=1)  # 1 for public, 0 for private

    # Timestamps
    saved_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="saved_papers")
    tags = relationship("Tag", secondary=saved_paper_tags, back_populates="papers")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    color = Column(String(7), default="#9333EA")  # Default purple color
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    papers = relationship("SavedPaper", secondary=saved_paper_tags, back_populates="tags")


class PaperInteraction(Base):
    """Track all paper interactions (views, swipes) for recommendations"""
    __tablename__ = "paper_interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    arxiv_id = Column(String(100), nullable=False, index=True)
    interaction_type = Column(String(20), nullable=False)  # 'view', 'like', 'dislike', 'save'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

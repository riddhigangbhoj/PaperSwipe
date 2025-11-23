from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PaperBase(BaseModel):
    arxiv_id: str
    title: str
    authors: List[str]
    abstract: str
    categories: List[str]
    published_date: str
    pdf_url: Optional[str] = None
    source_url: str


class PaperResponse(PaperBase):
    id: str  # For frontend compatibility

    class Config:
        from_attributes = True


class SavedPaperCreate(BaseModel):
    arxiv_id: str
    title: str
    authors: List[str]
    abstract: str
    categories: List[str]
    published_date: str
    pdf_url: Optional[str] = None
    source_url: str
    notes: Optional[str] = None
    is_public: bool = True


class SavedPaperUpdate(BaseModel):
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    is_public: Optional[bool] = None


class SavedPaperResponse(BaseModel):
    id: int
    arxiv_id: str
    title: str
    authors: List[str]
    abstract: str
    categories: List[str]
    published_date: str
    pdf_url: Optional[str] = None
    source_url: str
    notes: Optional[str] = None
    tags: List[str] = []
    is_public: bool
    saved_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TagCreate(BaseModel):
    name: str
    color: Optional[str] = "#9333EA"


class TagResponse(BaseModel):
    id: int
    name: str
    color: str
    created_at: datetime

    class Config:
        from_attributes = True


class PaperInteractionCreate(BaseModel):
    arxiv_id: str
    interaction_type: str  # 'view', 'like', 'dislike', 'save'


class SearchFilters(BaseModel):
    query: Optional[str] = None
    categories: Optional[List[str]] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    sort_by: Optional[str] = "relevance"  # 'relevance', 'date', 'citations'
    max_results: int = 20


class MigrationData(BaseModel):
    """Schema for migrating localStorage data to backend"""
    preferences: dict
    saved_papers: List[dict]

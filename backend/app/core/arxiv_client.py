import httpx
import feedparser
import asyncio
from typing import List, Dict, Optional
from datetime import datetime
from ..config import settings


class ArxivClient:
    """Client for fetching papers from arXiv API"""

    def __init__(self):
        self.base_url = settings.ARXIV_API_BASE
        self.rate_limit_delay = settings.ARXIV_RATE_LIMIT_DELAY

    async def search_papers(
        self,
        query: Optional[str] = None,
        categories: Optional[List[str]] = None,
        max_results: int = 20,
        start: int = 0,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        sort_by: str = "relevance"
    ) -> List[Dict]:
        """
        Search papers on arXiv with filters
        """
        # Build search query
        search_terms = []

        if query:
            search_terms.append(f'all:"{query}"')

        if categories:
            cat_query = " OR ".join([f'cat:{cat}' for cat in categories])
            search_terms.append(f'({cat_query})')

        if not search_terms:
            # Default: get recent papers from popular CS categories
            search_terms.append('(cat:cs.AI OR cat:cs.LG OR cat:cs.CL OR cat:cs.CV)')

        final_query = " AND ".join(search_terms)

        # Build sort parameter
        sort_param = "relevance"
        if sort_by == "date":
            sort_param = "submittedDate"
        elif sort_by == "updated":
            sort_param = "lastUpdatedDate"

        # Make request to arXiv API
        params = {
            "search_query": final_query,
            "start": start,
            "max_results": max_results,
            "sortBy": sort_param,
            "sortOrder": "descending"
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()

                # Parse XML response
                feed = feedparser.parse(response.text)

                papers = []
                for entry in feed.entries:
                    # Parse authors
                    authors = [author.name for author in entry.get('authors', [])]

                    # Parse categories
                    categories = []
                    for tag in entry.get('tags', []):
                        categories.append(tag.term)

                    # Get arXiv ID
                    arxiv_id = entry.id.split('/abs/')[-1]

                    # Published date
                    published_date = entry.published if hasattr(entry, 'published') else ""

                    # Filter by date if specified
                    if date_from or date_to:
                        try:
                            pub_date = datetime.strptime(published_date[:10], "%Y-%m-%d")
                            if date_from:
                                from_date = datetime.strptime(date_from, "%Y-%m-%d")
                                if pub_date < from_date:
                                    continue
                            if date_to:
                                to_date = datetime.strptime(date_to, "%Y-%m-%d")
                                if pub_date > to_date:
                                    continue
                        except:
                            pass

                    # Build paper dict
                    paper = {
                        "id": arxiv_id,
                        "arxiv_id": arxiv_id,
                        "title": entry.title.replace('\n', ' ').strip(),
                        "authors": authors,
                        "abstract": entry.summary.replace('\n', ' ').strip(),
                        "categories": categories,
                        "publishedDate": published_date,
                        "published_date": published_date,
                        "pdfUrl": entry.link.replace('/abs/', '/pdf/') if hasattr(entry, 'link') else None,
                        "pdf_url": entry.link.replace('/abs/', '/pdf/') if hasattr(entry, 'link') else None,
                        "sourceUrl": entry.id,
                        "source_url": entry.id
                    }
                    papers.append(paper)

                # Rate limiting
                await asyncio.sleep(self.rate_limit_delay)

                return papers

        except Exception as e:
            print(f"Error fetching papers from arXiv: {e}")
            return []

    async def get_paper_by_id(self, arxiv_id: str) -> Optional[Dict]:
        """Get a specific paper by arXiv ID"""
        papers = await self.search_papers(query=f"id:{arxiv_id}", max_results=1)
        return papers[0] if papers else None


# Singleton instance
arxiv_client = ArxivClient()

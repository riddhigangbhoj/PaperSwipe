import json
from typing import List
from ..models import SavedPaper


def export_to_bibtex(papers: List[SavedPaper]) -> str:
    """Export papers to BibTeX format"""
    bibtex_entries = []

    for paper in papers:
        authors_list = json.loads(paper.authors)
        authors_str = " and ".join(authors_list)

        # Create citation key from first author and year
        year = paper.published_date[:4] if paper.published_date else "0000"
        first_author = authors_list[0].split()[-1] if authors_list else "Unknown"
        citation_key = f"{first_author}{year}_{paper.arxiv_id.replace('.', '_')}"

        entry = f"""@article{{{citation_key},
  title = {{{paper.title}}},
  author = {{{authors_str}}},
  year = {{{year}}},
  journal = {{arXiv preprint arXiv:{paper.arxiv_id}}},
  eprint = {{{paper.arxiv_id}}},
  archivePrefix = {{arXiv}},
  url = {{{paper.source_url}}}
}}"""
        bibtex_entries.append(entry)

    return "\n\n".join(bibtex_entries)


def export_to_csv(papers: List[SavedPaper]) -> str:
    """Export papers to CSV format"""
    csv_lines = ["Title,Authors,Year,arXiv ID,Categories,URL,Notes"]

    for paper in papers:
        authors_list = json.loads(paper.authors)
        authors_str = "; ".join(authors_list)
        year = paper.published_date[:4] if paper.published_date else ""
        categories_list = json.loads(paper.categories)
        categories_str = "; ".join(categories_list)
        notes = (paper.notes or "").replace('"', '""')  # Escape quotes

        csv_lines.append(
            f'"{paper.title}","{authors_str}","{year}","{paper.arxiv_id}","{categories_str}","{paper.source_url}","{notes}"'
        )

    return "\n".join(csv_lines)


def export_to_text(papers: List[SavedPaper]) -> str:
    """Export papers to plain text format"""
    text_entries = []

    for i, paper in enumerate(papers, 1):
        authors_list = json.loads(paper.authors)
        authors_str = ", ".join(authors_list)
        categories_list = json.loads(paper.categories)
        categories_str = ", ".join(categories_list)

        entry = f"""[{i}] {paper.title}
Authors: {authors_str}
Published: {paper.published_date}
arXiv ID: {paper.arxiv_id}
Categories: {categories_str}
URL: {paper.source_url}
"""
        if paper.notes:
            entry += f"Notes: {paper.notes}\n"

        text_entries.append(entry)

    return "\n" + ("-" * 80) + "\n".join(text_entries)

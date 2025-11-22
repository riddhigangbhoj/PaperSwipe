import axios from 'axios'

// Use our backend API which proxies arXiv requests (no CORS issues)
const BACKEND_API = 'http://localhost:8000/api'

export const fetchPapers = async (topics, seenPaperIds = [], maxResults = 20) => {
  try {
    const categories = topics.join(',')
    const response = await axios.get(`${BACKEND_API}/papers/search`, {
      params: {
        categories,
        max_results: maxResults,
        sort_by: 'date'
      }
    })

    // Transform backend response to match expected format
    const papers = response.data.map(paper => ({
      id: paper.arxiv_id,
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract,
      categories: paper.categories,
      publishedDate: paper.published_date,
      pdfUrl: paper.pdf_url,
      sourceUrl: paper.source_url
    }))

    // Filter out papers we've already seen
    const unseenPapers = papers.filter(paper => !seenPaperIds.includes(paper.id))

    return unseenPapers.slice(0, maxResults)
  } catch (error) {
    console.error('Error fetching from backend:', error)
    throw new Error('Failed to fetch papers from arXiv')
  }
}

export const searchPapers = async (searchQuery, maxResults = 20) => {
  try {
    const response = await axios.get(`${BACKEND_API}/papers/search`, {
      params: {
        query: searchQuery,
        max_results: maxResults,
        sort_by: 'relevance'
      }
    })

    // Transform backend response to match expected format
    return response.data.map(paper => ({
      id: paper.arxiv_id,
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract,
      categories: paper.categories,
      publishedDate: paper.published_date,
      pdfUrl: paper.pdf_url,
      sourceUrl: paper.source_url
    }))
  } catch (error) {
    console.error('Error searching papers:', error)
    throw new Error('Failed to search papers')
  }
}

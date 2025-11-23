import axios from 'axios'

// Backend API URL - use environment variable or default to Render deployment
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://paperswipe-api.onrender.com'

// Map common topic names to arXiv category codes
const topicToCategoryMap = {
  'machine learning': 'cs.LG',
  'artificial intelligence': 'cs.AI',
  'computer vision': 'cs.CV',
  'natural language processing': 'cs.CL',
  'robotics': 'cs.RO',
  'physics': 'physics',
  'mathematics': 'math',
  'statistics': 'stat',
  'quantitative biology': 'q-bio',
  'quantitative finance': 'q-fin',
  'economics': 'econ',
  'electrical engineering': 'eess',
  'neural networks': 'cs.NE',
  'cryptography': 'cs.CR',
  'databases': 'cs.DB',
  'software engineering': 'cs.SE',
  'quantum computing': 'quant-ph',
  'astrophysics': 'astro-ph',
  'condensed matter': 'cond-mat',
  'high energy physics': 'hep-ph'
}

const normalizeCategory = (topic) => {
  const lower = topic.toLowerCase().trim()
  return topicToCategoryMap[lower] || topic
}

export const fetchPapers = async (topics, seenPaperIds = [], maxResults = 20) => {
  try {
    // Convert topics to arXiv categories
    const categories = topics.map(normalizeCategory)

    // Call our backend API (no CORS issues!)
    const response = await axios.get(`${API_BASE}/api/papers/search`, {
      params: {
        categories: categories.join(','),
        max_results: maxResults + seenPaperIds.length,
        sort_by: 'date'
      }
    })

    // Backend returns JSON directly - map to frontend format
    const papers = response.data.map(paper => ({
      id: paper.arxiv_id || paper.id,
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract,
      categories: paper.categories,
      publishedDate: paper.publishedDate || paper.published_date,
      pdfUrl: paper.pdfUrl || paper.pdf_url,
      sourceUrl: paper.sourceUrl || paper.source_url
    }))

    // Filter out papers we've already seen
    const unseenPapers = papers.filter(paper => !seenPaperIds.includes(paper.id))

    return unseenPapers.slice(0, maxResults)
  } catch (error) {
    console.error('Error fetching from backend:', error)
    throw new Error('Failed to fetch papers')
  }
}

export const searchPapers = async (searchQuery, maxResults = 20) => {
  try {
    // Call our backend API
    const response = await axios.get(`${API_BASE}/api/papers/search`, {
      params: {
        query: searchQuery,
        max_results: maxResults,
        sort_by: 'relevance'
      }
    })

    // Backend returns JSON directly - map to frontend format
    return response.data.map(paper => ({
      id: paper.arxiv_id || paper.id,
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract,
      categories: paper.categories,
      publishedDate: paper.publishedDate || paper.published_date,
      pdfUrl: paper.pdfUrl || paper.pdf_url,
      sourceUrl: paper.sourceUrl || paper.source_url
    }))
  } catch (error) {
    console.error('Error searching papers:', error)
    throw new Error('Failed to search papers')
  }
}

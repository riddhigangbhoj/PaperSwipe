import axios from 'axios'

// arXiv API endpoint (we use a CORS proxy for browser requests)
const ARXIV_API = 'https://export.arxiv.org/api/query'

// Use environment variable for CORS proxy, with fallback
// corsproxy.io often returns 403 in production, so we use allorigins as default
const CORS_PROXY = import.meta.env.VITE_CORS_PROXY_URL || 'https://api.allorigins.win/raw?url='

// Parse arXiv XML response to JSON
const parseArxivResponse = (xmlText) => {
  const parser = new DOMParser()
  const xml = parser.parseFromString(xmlText, 'text/xml')
  const entries = xml.querySelectorAll('entry')

  return Array.from(entries).map(entry => {
    const id = entry.querySelector('id')?.textContent || ''
    const arxivId = id.split('/abs/').pop()?.split('v')[0] || id

    const authors = Array.from(entry.querySelectorAll('author name'))
      .map(author => author.textContent)

    const categories = Array.from(entry.querySelectorAll('category'))
      .map(cat => cat.getAttribute('term'))
      .filter(Boolean)

    const links = Array.from(entry.querySelectorAll('link'))
    const pdfLink = links.find(link => link.getAttribute('title') === 'pdf')
    const absLink = links.find(link => link.getAttribute('type') === 'text/html')

    return {
      id: arxivId,
      title: entry.querySelector('title')?.textContent?.replace(/\s+/g, ' ').trim() || '',
      authors,
      abstract: entry.querySelector('summary')?.textContent?.trim() || '',
      categories,
      publishedDate: entry.querySelector('published')?.textContent || '',
      pdfUrl: pdfLink?.getAttribute('href') || `https://arxiv.org/pdf/${arxivId}.pdf`,
      sourceUrl: absLink?.getAttribute('href') || `https://arxiv.org/abs/${arxivId}`
    }
  })
}

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

    // Build arXiv query - search in category
    const catQuery = categories.map(cat => `cat:${cat}`).join('+OR+')

    const url = `${ARXIV_API}?search_query=${catQuery}&start=0&max_results=${maxResults + seenPaperIds.length}&sortBy=submittedDate&sortOrder=descending`

    // Use CORS proxy
    const response = await axios.get(`${CORS_PROXY}${encodeURIComponent(url)}`)

    const papers = parseArxivResponse(response.data)

    // Filter out papers we've already seen
    const unseenPapers = papers.filter(paper => !seenPaperIds.includes(paper.id))

    return unseenPapers.slice(0, maxResults)
  } catch (error) {
    console.error('Error fetching from arXiv:', error)
    throw new Error('Failed to fetch papers from arXiv')
  }
}

export const searchPapers = async (searchQuery, maxResults = 20) => {
  try {
    // Encode search query for arXiv
    const query = encodeURIComponent(searchQuery)

    const url = `${ARXIV_API}?search_query=all:${query}&start=0&max_results=${maxResults}&sortBy=relevance`

    // Use CORS proxy
    const response = await axios.get(`${CORS_PROXY}${encodeURIComponent(url)}`)

    return parseArxivResponse(response.data)
  } catch (error) {
    console.error('Error searching papers:', error)
    throw new Error('Failed to search papers')
  }
}

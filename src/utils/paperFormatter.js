export const parseArxivXML = (xmlString) => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
  const entries = xmlDoc.querySelectorAll('entry')

  const papers = []

  entries.forEach(entry => {
    const id = entry.querySelector('id')?.textContent?.trim() || ''
    const title = entry.querySelector('title')?.textContent?.trim().replace(/\n/g, ' ') || ''
    const summary = entry.querySelector('summary')?.textContent?.trim().replace(/\n/g, ' ') || ''
    const published = entry.querySelector('published')?.textContent?.trim() || ''

    const authorElements = entry.querySelectorAll('author name')
    const authors = Array.from(authorElements).map(a => a.textContent.trim())

    const categoryElements = entry.querySelectorAll('category')
    const categories = Array.from(categoryElements).map(c => c.getAttribute('term'))

    const pdfLink = entry.querySelector('link[title="pdf"]')?.getAttribute('href')

    papers.push({
      id: id.split('/').pop(), // Extract arXiv ID
      title,
      authors,
      abstract: summary,
      publishedDate: published,
      source: 'arxiv',
      sourceUrl: id,
      pdfUrl: pdfLink || null,
      doi: null,
      categories,
      citationCount: null,
      thumbnailUrl: null
    })
  })

  return papers
}

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatAuthors = (authors, maxAuthors = 3) => {
  if (authors.length <= maxAuthors) {
    return authors.join(', ')
  }
  return `${authors.slice(0, maxAuthors).join(', ')} et al.`
}

export const truncateText = (text, maxLength = 150) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Export saved papers to BibTeX format
export const exportToBibTeX = (papers) => {
  let bibtex = ''

  papers.forEach((paper, index) => {
    const id = paper.id || `paper${index + 1}`
    const year = new Date(paper.publishedDate).getFullYear()
    const authors = paper.authors.join(' and ')

    bibtex += `@article{${id},\n`
    bibtex += `  title={${paper.title}},\n`
    bibtex += `  author={${authors}},\n`
    bibtex += `  year={${year}},\n`
    bibtex += `  journal={arXiv preprint},\n`
    bibtex += `  url={${paper.sourceUrl}}\n`
    bibtex += `}\n\n`
  })

  return bibtex
}

// Export saved papers to CSV format
export const exportToCSV = (papers) => {
  const headers = ['Title', 'Authors', 'Published Date', 'Categories', 'URL', 'PDF URL']
  let csv = headers.join(',') + '\n'

  papers.forEach(paper => {
    const row = [
      `"${paper.title.replace(/"/g, '""')}"`,
      `"${paper.authors.join('; ')}"`,
      `"${paper.publishedDate}"`,
      `"${paper.categories.join('; ')}"`,
      `"${paper.sourceUrl}"`,
      `"${paper.pdfUrl || ''}"`
    ]
    csv += row.join(',') + '\n'
  })

  return csv
}

// Export saved papers as plain text list
export const exportToText = (papers) => {
  let text = 'My Saved Research Papers\n'
  text += '========================\n\n'

  papers.forEach((paper, index) => {
    text += `${index + 1}. ${paper.title}\n`
    text += `   Authors: ${paper.authors.join(', ')}\n`
    text += `   Published: ${new Date(paper.publishedDate).toLocaleDateString()}\n`
    text += `   Categories: ${paper.categories.join(', ')}\n`
    text += `   URL: ${paper.sourceUrl}\n`
    if (paper.pdfUrl) {
      text += `   PDF: ${paper.pdfUrl}\n`
    }
    text += `\n`
  })

  return text
}

// Trigger download of file
export const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Main export functions
export const exportPapers = {
  toBibTeX: (papers) => {
    const content = exportToBibTeX(papers)
    downloadFile(content, 'papers.bib', 'text/plain')
  },

  toCSV: (papers) => {
    const content = exportToCSV(papers)
    downloadFile(content, 'papers.csv', 'text/csv')
  },

  toText: (papers) => {
    const content = exportToText(papers)
    downloadFile(content, 'papers.txt', 'text/plain')
  }
}

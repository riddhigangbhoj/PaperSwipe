import { useState } from 'react'
import { useUserPreferences } from '../context/UserPreferencesContext'
import { useAuth } from '../context/AuthContext'
import { formatAuthors, formatDate, truncateText } from '../utils/paperFormatter'
import ExportButton from '../components/SavedPapers/ExportButton'
import NotesEditor from '../components/SavedPapers/NotesEditor'
import { Link } from 'react-router-dom'

const Saved = () => {
  const { savedPapers, removePaper, updatePaperNotes, updatePaperTags, loading, syncError } = useUserPreferences()
  const { isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')

  // Get all unique tags from saved papers
  const allTags = [...new Set(savedPapers.flatMap(paper => paper.tags || []))]

  const filteredPapers = savedPapers.filter(paper => {
    const matchesSearch =
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      paper.abstract.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTag = !selectedTag || (paper.tags && paper.tags.includes(selectedTag))

    return matchesSearch && matchesTag
  })

  const handleRemove = (id) => {
    if (window.confirm('Are you sure you want to remove this paper from your saved collection?')) {
      removePaper(id)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Saved Papers
            </h1>
            <p className="text-gray-600">
              {savedPapers.length} paper{savedPapers.length !== 1 ? 's' : ''} in your collection
              {loading && <span className="ml-2 text-sm text-gray-400">(syncing...)</span>}
            </p>
          </div>
          <ExportButton papers={savedPapers} />
        </div>

        {/* Login prompt for unauthenticated users */}
        {!isAuthenticated() && savedPapers.length > 0 && (
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-purple-800 font-medium">Want to sync your papers across devices?</p>
              <p className="text-purple-600 text-sm">Create an account to save papers to the cloud</p>
            </div>
            <Link
              to="/register"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              Sign up
            </Link>
          </div>
        )}

        {/* Sync error */}
        {syncError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{syncError}</p>
          </div>
        )}

        {/* Search */}
        {savedPapers.length > 0 && (
          <div className="mb-6 space-y-4">
            <input
              type="text"
              placeholder="Search saved papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Filter by tag:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedTag('')}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      !selectedTag
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    All
                  </button>
                  {allTags.map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedTag === tag
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Papers List */}
        {filteredPapers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchQuery ? 'No papers found' : 'No saved papers yet'}
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? 'Try a different search term'
                : 'Start swiping to save papers you\'re interested in'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPapers.map(paper => (
              <div
                key={paper.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {paper.categories.slice(0, 3).map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-primary text-xs font-medium rounded"
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {paper.title}
                </h3>

                {/* Authors and Date */}
                <p className="text-sm text-gray-600 mb-2">
                  {formatAuthors(paper.authors)}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Published: {formatDate(paper.publishedDate)}
                </p>

                {/* Abstract */}
                <p className="text-gray-700 mb-4">
                  {truncateText(paper.abstract, 200)}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  {paper.pdfUrl && (
                    <a
                      href={paper.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      View PDF
                    </a>
                  )}
                  <a
                    href={paper.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    View Paper
                  </a>
                  <button
                    onClick={() => handleRemove(paper.id)}
                    className="ml-auto px-4 py-2 bg-danger text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>

                {/* Notes and Tags */}
                <NotesEditor
                  paper={paper}
                  onSaveNotes={updatePaperNotes}
                  onSaveTags={updatePaperTags}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Saved

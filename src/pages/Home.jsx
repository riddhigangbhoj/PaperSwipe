import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePapers } from '../context/PapersContext'
import { useUserPreferences } from '../context/UserPreferencesContext'
import CardStack from '../components/Card/CardStack'
import PaperDetailModal from '../components/Modal/PaperDetailModal'
import SearchBar from '../components/Filters/SearchBar'
import FilterPanel from '../components/Filters/FilterPanel'

const Home = () => {
  const navigate = useNavigate()
  const { papers, loading, error, searchQuery, fetchMorePapers, handleSwipe, handleSearch, handleFilterChange, resetAndRefetch } = usePapers()
  const { preferences, savePaper, markAsDisliked } = useUserPreferences()
  const [selectedPaper, setSelectedPaper] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const cardStackRef = useRef()

  useEffect(() => {
    // Redirect to onboarding if no topics selected
    if (preferences.selectedTopics.length === 0) {
      navigate('/')
      return
    }

    // Fetch initial papers if none loaded
    if (papers.length === 0 && !loading) {
      fetchMorePapers()
    }
  }, [preferences.selectedTopics])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (modalOpen) return // Don't handle keys when modal is open

      if (papers.length === 0) return

      if (e.key === 'ArrowLeft') {
        cardStackRef.current?.swipe('left')
      } else if (e.key === 'ArrowRight') {
        cardStackRef.current?.swipe('right')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [papers, modalOpen])

  const onSwipe = (direction, paper) => {
    if (direction === 'right') {
      savePaper(paper)
    } else if (direction === 'left') {
      markAsDisliked(paper.id)
    }
    handleSwipe(direction, paper)
  }

  const onCardClick = (paper) => {
    setSelectedPaper(paper)
    setModalOpen(true)
  }

  const handleSave = (paper) => {
    savePaper(paper)
  }

  const handleDismiss = (paper) => {
    markAsDisliked(paper.id)
  }

  if (loading && papers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading papers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchMorePapers}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Instructions */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Research Papers
          </h1>
          <p className="text-gray-600">
            Use arrow keys, swipe, or click arrows to navigate
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
          <div className="flex-1 w-full">
            <SearchBar onSearch={handleSearch} />
          </div>
          <FilterPanel onFilterChange={handleFilterChange} />
        </div>

        {searchQuery && (
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-700">
                Showing results for: <span className="font-semibold">"{searchQuery}"</span>
              </p>
              <button
                onClick={() => {
                  handleSearch('')
                  setTimeout(() => fetchMorePapers(), 100)
                }}
                className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                ✕ Clear & Browse All
              </button>
            </div>
          </div>
        )}

        {/* No Papers Message with Reset Option */}
        {!loading && papers.length === 0 && !searchQuery && (
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-3 bg-yellow-50 border border-yellow-200 px-4 py-3 rounded-lg">
              <p className="text-sm text-gray-700">
                You've seen all available papers!
              </p>
              <button
                onClick={() => {
                  if (window.confirm('This will clear your viewing history and show papers again. Your saved papers will NOT be deleted. Continue?')) {
                    resetAndRefetch()
                  }
                }}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
              >
                Reset & See Papers Again
              </button>
            </div>
          </div>
        )}

        {/* Card Stack with Side Arrows */}
        <div className="relative flex items-center justify-center gap-8">
          {/* Left Arrow Button */}
          <button
            onClick={() => cardStackRef.current?.swipe('left')}
            className="flex-shrink-0 w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-danger hover:bg-red-50 hover:scale-110 transition-all"
            title="Skip (Left Arrow)"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Card Stack */}
          <CardStack
            ref={cardStackRef}
            papers={papers}
            onSwipe={onSwipe}
            onCardClick={() => {}} // Disable click to open modal
          />

          {/* Right Arrow Button */}
          <button
            onClick={() => cardStackRef.current?.swipe('right')}
            className="flex-shrink-0 w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-success hover:bg-green-50 hover:scale-110 transition-all"
            title="Save (Right Arrow)"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-6 mt-8">
          <button
            onClick={() => cardStackRef.current?.swipe('left')}
            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-danger hover:bg-red-50 transition-colors"
            title="Skip"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            onClick={() => {
              if (papers.length > 0) {
                setSelectedPaper(papers[papers.length - 1])
                setModalOpen(true)
              }
            }}
            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-primary hover:bg-blue-50 transition-colors"
            title="View Details"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <button
            onClick={() => cardStackRef.current?.swipe('right')}
            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-success hover:bg-green-50 transition-colors"
            title="Save"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>

        {/* Papers Remaining Counter */}
        <div className="text-center mt-6">
          <p className="text-gray-500">
            Papers remaining: {papers.length}
            {loading && <span className="ml-2 text-primary">(Loading more...)</span>}
          </p>
        </div>
      </div>

      {/* Paper Detail Modal */}
      <PaperDetailModal
        paper={selectedPaper}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDismiss={handleDismiss}
      />
    </div>
  )
}

export default Home

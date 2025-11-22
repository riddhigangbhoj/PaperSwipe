import { createContext, useState, useContext, useEffect } from 'react'
import { fetchPapers, searchPapers } from '../services/api/arxivAPI'
import { useUserPreferences } from './UserPreferencesContext'

const PapersContext = createContext()

export const PapersProvider = ({ children }) => {
  const [papers, setPapers] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState(null)
  const { preferences, markAsSeen, resetSeenPapers } = useUserPreferences()

  const fetchMorePapers = async (useSearch = false) => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      let newPapers = []

      if (useSearch && searchQuery) {
        // Search mode
        newPapers = await searchPapers(searchQuery)
      } else {
        // Topic-based browsing mode
        const topics = preferences.selectedTopics.length > 0
          ? preferences.selectedTopics
          : ['cs.AI'] // Default topic

        newPapers = await fetchPapers(topics, preferences.seenPaperIds)
      }

      // Apply date filter if set
      if (dateFilter) {
        newPapers = newPapers.filter(paper => {
          const paperDate = new Date(paper.publishedDate)
          return paperDate >= dateFilter
        })
      }

      setPapers(prev => [...prev, ...newPapers])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching papers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    setPapers([]) // Clear existing papers
    if (query) {
      fetchMorePapers(true)
    } else {
      fetchMorePapers(false)
    }
  }

  const handleFilterChange = (filters) => {
    if (filters.dateFrom !== undefined) {
      setDateFilter(filters.dateFrom)
      setPapers([]) // Clear existing papers
      setTimeout(() => {
        fetchMorePapers(!!searchQuery)
      }, 100)
    }
  }

  const handleSwipe = (direction, paper) => {
    markAsSeen(paper.id)

    // Fetch more when we're 5 papers away from the end
    if (currentIndex >= papers.length - 5) {
      fetchMorePapers()
    }
  }

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(prev + 1, papers.length - 1))
  }

  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }

  const resetAndRefetch = async () => {
    console.log('resetAndRefetch called')
    // Clear current papers first
    setPapers([])
    setCurrentIndex(0)
    setLoading(true)
    setError(null)

    // Reset seen papers in preferences
    resetSeenPapers()

    try {
      // Fetch papers with empty seenPaperIds (don't rely on preferences state)
      const topics = preferences.selectedTopics.length > 0
        ? preferences.selectedTopics
        : ['cs.AI']

      console.log('Fetching papers for topics:', topics)
      const newPapers = await fetchPapers(topics, []) // Pass empty array directly
      console.log('Fetched papers:', newPapers.length, newPapers)
      setPapers(newPapers)
    } catch (err) {
      console.error('Error in resetAndRefetch:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PapersContext.Provider value={{
      papers,
      currentIndex,
      loading,
      error,
      searchQuery,
      fetchMorePapers,
      handleSwipe,
      handleSearch,
      handleFilterChange,
      goToNext,
      goToPrevious,
      resetAndRefetch
    }}>
      {children}
    </PapersContext.Provider>
  )
}

export const usePapers = () => {
  const context = useContext(PapersContext)
  if (!context) {
    throw new Error('usePapers must be used within PapersProvider')
  }
  return context
}

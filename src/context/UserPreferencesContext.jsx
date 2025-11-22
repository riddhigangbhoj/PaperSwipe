import { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

const UserPreferencesContext = createContext()

export const UserPreferencesProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()

  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('paperswipe_preferences')
    return saved ? JSON.parse(saved) : {
      selectedTopics: [],
      dateRange: { from: null, to: null },
      minCitations: 0,
      seenPaperIds: [],
      likedPaperIds: [],
      dislikedPaperIds: []
    }
  })

  const [savedPapers, setSavedPapers] = useState(() => {
    const saved = localStorage.getItem('paperswipe_saved')
    return saved ? JSON.parse(saved) : []
  })

  const [loading, setLoading] = useState(false)
  const [syncError, setSyncError] = useState(null)

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('paperswipe_preferences', JSON.stringify(preferences))
  }, [preferences])

  // Save papers to localStorage (as backup / for offline)
  useEffect(() => {
    localStorage.setItem('paperswipe_saved', JSON.stringify(savedPapers))
  }, [savedPapers])

  // Fetch saved papers from Supabase when authenticated
  const fetchSavedPapers = useCallback(async () => {
    if (!isAuthenticated()) return

    setLoading(true)
    setSyncError(null)
    try {
      const { data, error } = await supabase
        .from('saved_papers')
        .select('*')
        .order('saved_at', { ascending: false })

      if (error) throw error

      // Map database format to frontend format
      const mappedPapers = data.map(p => ({
        id: p.arxiv_id,
        title: p.title,
        authors: p.authors,
        abstract: p.abstract,
        categories: p.categories,
        publishedDate: p.published_date,
        pdfUrl: p.pdf_url,
        sourceUrl: p.source_url,
        notes: p.notes || '',
        tags: [], // TODO: fetch tags separately if needed
        dbId: p.id // Store database ID for updates/deletes
      }))

      setSavedPapers(mappedPapers)
      setPreferences(prev => ({
        ...prev,
        likedPaperIds: mappedPapers.map(p => p.id)
      }))
    } catch (err) {
      console.error('Error fetching saved papers:', err)
      setSyncError('Failed to sync with server')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  // Fetch on auth change
  useEffect(() => {
    if (isAuthenticated()) {
      fetchSavedPapers()
    }
  }, [user, isAuthenticated, fetchSavedPapers])

  const savePaper = async (paper) => {
    // Optimistically update UI
    setSavedPapers(prev => {
      if (prev.find(p => p.id === paper.id)) return prev
      return [...prev, { ...paper, notes: '', tags: [] }]
    })
    setPreferences(prev => ({
      ...prev,
      likedPaperIds: [...prev.likedPaperIds, paper.id]
    }))

    // If authenticated, save to Supabase
    if (isAuthenticated()) {
      try {
        const { data, error } = await supabase
          .from('saved_papers')
          .insert({
            arxiv_id: paper.id,
            title: paper.title,
            authors: paper.authors,
            abstract: paper.abstract,
            categories: paper.categories,
            published_date: paper.publishedDate,
            pdf_url: paper.pdfUrl,
            source_url: paper.sourceUrl,
            is_public: false
          })
          .select()
          .single()

        if (error) throw error

        // Update with database ID
        setSavedPapers(prev => prev.map(p =>
          p.id === paper.id ? { ...p, dbId: data.id } : p
        ))
      } catch (err) {
        console.error('Error saving paper to Supabase:', err)
        setSyncError('Failed to save paper to server')
      }
    }
  }

  const removePaper = async (id) => {
    const paperToRemove = savedPapers.find(p => p.id === id)

    // Optimistically update UI
    setSavedPapers(prev => prev.filter(p => p.id !== id))
    setPreferences(prev => ({
      ...prev,
      likedPaperIds: prev.likedPaperIds.filter(pid => pid !== id)
    }))

    // If authenticated and paper has database ID, remove from Supabase
    if (isAuthenticated() && paperToRemove?.dbId) {
      try {
        const { error } = await supabase
          .from('saved_papers')
          .delete()
          .eq('id', paperToRemove.dbId)

        if (error) throw error
      } catch (err) {
        console.error('Error removing paper from Supabase:', err)
        setSyncError('Failed to remove paper from server')
        // Revert on error
        setSavedPapers(prev => [...prev, paperToRemove])
      }
    }
  }

  const updatePaperNotes = async (id, notes) => {
    const paper = savedPapers.find(p => p.id === id)

    // Optimistically update UI
    setSavedPapers(prev => prev.map(p =>
      p.id === id ? { ...p, notes } : p
    ))

    // If authenticated and paper has database ID, update on Supabase
    if (isAuthenticated() && paper?.dbId) {
      try {
        const { error } = await supabase
          .from('saved_papers')
          .update({ notes, updated_at: new Date().toISOString() })
          .eq('id', paper.dbId)

        if (error) throw error
      } catch (err) {
        console.error('Error updating notes on Supabase:', err)
        setSyncError('Failed to update notes on server')
      }
    }
  }

  const updatePaperTags = async (id, tags) => {
    // Optimistically update UI
    setSavedPapers(prev => prev.map(p =>
      p.id === id ? { ...p, tags } : p
    ))
    // TODO: Implement tag sync with Supabase if needed
  }

  const markAsSeen = (id) => {
    setPreferences(prev => ({
      ...prev,
      seenPaperIds: [...prev.seenPaperIds, id]
    }))
  }

  const markAsDisliked = (id) => {
    setPreferences(prev => ({
      ...prev,
      dislikedPaperIds: [...prev.dislikedPaperIds, id]
    }))
  }

  const resetSeenPapers = () => {
    setPreferences(prev => ({
      ...prev,
      seenPaperIds: [],
      dislikedPaperIds: []
    }))
  }

  const updatePreferences = (newPrefs) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }))
  }

  // Export papers to various formats (client-side)
  const exportPapers = async (format) => {
    const papers = savedPapers

    if (format === 'bibtex') {
      const content = papers.map(p => {
        const authorKey = p.authors[0]?.split(' ').pop() || 'Unknown'
        const year = p.publishedDate?.split('-')[0] || 'XXXX'
        const key = `${authorKey}${year}_${p.id.replace(/\./g, '_')}`
        return `@article{${key},
  title = {${p.title}},
  author = {${p.authors.join(' and ')}},
  year = {${year}},
  journal = {arXiv preprint arXiv:${p.id}},
  eprint = {${p.id}},
  archivePrefix = {arXiv},
  url = {${p.sourceUrl}}
}`
      }).join('\n\n')

      return new Blob([content], { type: 'application/x-bibtex' })
    }

    if (format === 'csv') {
      const header = 'Title,Authors,Published Date,arXiv ID,PDF URL,Abstract\n'
      const rows = papers.map(p =>
        `"${p.title.replace(/"/g, '""')}","${p.authors.join('; ')}","${p.publishedDate}","${p.id}","${p.pdfUrl}","${p.abstract?.replace(/"/g, '""') || ''}"`
      ).join('\n')

      return new Blob([header + rows], { type: 'text/csv' })
    }

    if (format === 'text') {
      const content = papers.map((p, i) =>
        `${i + 1}. ${p.title}\n   Authors: ${p.authors.join(', ')}\n   Published: ${p.publishedDate}\n   arXiv: ${p.id}\n   URL: ${p.sourceUrl}\n`
      ).join('\n')

      return new Blob([content], { type: 'text/plain' })
    }

    throw new Error('Unknown format')
  }

  return (
    <UserPreferencesContext.Provider value={{
      preferences,
      savedPapers,
      loading,
      syncError,
      savePaper,
      removePaper,
      updatePaperNotes,
      updatePaperTags,
      markAsSeen,
      markAsDisliked,
      resetSeenPapers,
      updatePreferences,
      fetchSavedPapers,
      exportPapers
    }}>
      {children}
    </UserPreferencesContext.Provider>
  )
}

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider')
  }
  return context
}

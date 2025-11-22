import { useState } from 'react'
import { useUserPreferences } from '../context/UserPreferencesContext'

const TOPICS = [
  { id: 'cs.AI', name: 'Artificial Intelligence' },
  { id: 'cs.LG', name: 'Machine Learning' },
  { id: 'cs.CV', name: 'Computer Vision' },
  { id: 'cs.CL', name: 'Computation & Language' },
  { id: 'cs.CR', name: 'Cryptography' },
  { id: 'cs.DB', name: 'Databases' },
  { id: 'cs.DS', name: 'Data Structures' },
  { id: 'cs.SE', name: 'Software Engineering' },
  { id: 'physics.quant-ph', name: 'Quantum Physics' },
  { id: 'math.CO', name: 'Combinatorics' },
]

const Settings = () => {
  const { preferences, updatePreferences, savedPapers } = useUserPreferences()
  const [selectedTopics, setSelectedTopics] = useState(preferences.selectedTopics)
  const [saved, setSaved] = useState(false)

  const toggleTopic = (topicId) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    )
  }

  const handleSave = () => {
    updatePreferences({ selectedTopics })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your viewing history? This cannot be undone.')) {
      updatePreferences({ seenPaperIds: [], dislikedPaperIds: [] })
      alert('History cleared successfully')
    }
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear ALL data including saved papers and preferences? This cannot be undone.')) {
      localStorage.removeItem('paperswipe_preferences')
      localStorage.removeItem('paperswipe_saved')
      localStorage.removeItem('paperswipe_history')
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* Topics Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Research Topics
          </h2>
          <p className="text-gray-600 mb-4">
            Select the topics you want to see papers from
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {TOPICS.map(topic => (
              <button
                key={topic.id}
                onClick={() => toggleTopic(topic.id)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selectedTopics.includes(topic.id)
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{topic.name}</span>
                  {selectedTopics.includes(topic.id) && (
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={selectedTopics.length === 0}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
              selectedTopics.length > 0
                ? 'bg-primary hover:bg-blue-600'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        {/* Statistics Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Statistics
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Saved Papers</p>
              <p className="text-3xl font-bold text-primary">{savedPapers.length}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Papers Viewed</p>
              <p className="text-3xl font-bold text-gray-700">{preferences.seenPaperIds.length}</p>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Data Management
          </h2>

          <div className="space-y-3">
            <button
              onClick={handleClearHistory}
              className="w-full py-3 px-6 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Clear Viewing History
            </button>

            <button
              onClick={handleClearAll}
              className="w-full py-3 px-6 rounded-lg font-medium text-white bg-danger hover:bg-red-600 transition-colors"
            >
              Clear All Data (including saved papers)
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            All data is stored locally in your browser. Clearing data cannot be undone.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Settings

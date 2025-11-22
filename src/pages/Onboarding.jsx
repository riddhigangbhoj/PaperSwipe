import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserPreferences } from '../context/UserPreferencesContext'

const TOPICS = [
  { id: 'cs.AI', name: 'Artificial Intelligence', description: 'AI, ML, Deep Learning' },
  { id: 'cs.LG', name: 'Machine Learning', description: 'Learning algorithms' },
  { id: 'cs.CV', name: 'Computer Vision', description: 'Image processing, recognition' },
  { id: 'cs.CL', name: 'Computation & Language', description: 'NLP, linguistics' },
  { id: 'cs.CR', name: 'Cryptography', description: 'Security, privacy' },
  { id: 'cs.DB', name: 'Databases', description: 'Data management' },
  { id: 'cs.DS', name: 'Data Structures', description: 'Algorithms, complexity' },
  { id: 'cs.SE', name: 'Software Engineering', description: 'Development practices' },
  { id: 'physics.quant-ph', name: 'Quantum Physics', description: 'Quantum mechanics' },
  { id: 'math.CO', name: 'Combinatorics', description: 'Discrete mathematics' },
]

const Onboarding = () => {
  const navigate = useNavigate()
  const { preferences, updatePreferences } = useUserPreferences()
  const [selectedTopics, setSelectedTopics] = useState(preferences.selectedTopics)

  useEffect(() => {
    // If user has already selected topics, redirect to swipe
    if (preferences.selectedTopics.length > 0) {
      navigate('/swipe')
    }
  }, [])

  const toggleTopic = (topicId) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    )
  }

  const handleContinue = () => {
    if (selectedTopics.length > 0) {
      updatePreferences({ selectedTopics })
      navigate('/swipe')
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to PaperSwipe
          </h1>
          <p className="text-lg text-gray-600">
            Discover research papers like never before. Swipe through the latest papers in your field.
          </p>
        </div>

        {/* Topic Selection */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Choose Your Interests
          </h2>
          <p className="text-gray-600 mb-6">
            Select at least one topic to get started. You can change this later in settings.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {TOPICS.map(topic => (
              <button
                key={topic.id}
                onClick={() => toggleTopic(topic.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedTopics.includes(topic.id)
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {topic.name}
                    </h3>
                    <p className="text-sm text-gray-600">{topic.description}</p>
                  </div>
                  {selectedTopics.includes(topic.id) && (
                    <svg
                      className="w-6 h-6 text-primary flex-shrink-0 ml-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
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
            onClick={handleContinue}
            disabled={selectedTopics.length === 0}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
              selectedTopics.length > 0
                ? 'bg-primary hover:bg-blue-600'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {selectedTopics.length === 0
              ? 'Select at least one topic'
              : `Continue with ${selectedTopics.length} topic${selectedTopics.length > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Onboarding

import { useState } from 'react'

const NotesEditor = ({ paper, onSaveNotes, onSaveTags }) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notes, setNotes] = useState(paper.notes || '')
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState(paper.tags || [])

  const handleSaveNotes = () => {
    onSaveNotes(paper.id, notes)
    setIsEditingNotes(false)
  }

  const handleAddTag = (e) => {
    e.preventDefault()
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()]
      setTags(newTags)
      onSaveTags(paper.id, newTags)
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove)
    setTags(newTags)
    onSaveTags(paper.id, newTags)
  }

  return (
    <div className="mt-4 border-t pt-4 space-y-3">
      {/* Notes Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700">Notes</label>
          {!isEditingNotes && (
            <button
              onClick={() => setIsEditingNotes(true)}
              className="text-xs text-primary hover:text-blue-600"
            >
              {notes ? 'Edit' : 'Add notes'}
            </button>
          )}
        </div>
        {isEditingNotes ? (
          <div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes about this paper..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setNotes(paper.notes || '')
                  setIsEditingNotes(false)
                }}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : notes ? (
          <p className="text-sm text-gray-600 italic">{notes}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">No notes yet</p>
        )}
      </div>

      {/* Tags Section */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-purple-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <form onSubmit={handleAddTag} className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag..."
            className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  )
}

export default NotesEditor

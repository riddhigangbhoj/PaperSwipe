import { formatDate } from '../../utils/paperFormatter'

const PaperDetailModal = ({ paper, isOpen, onClose, onSave, onDismiss }) => {
  if (!isOpen || !paper) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Paper Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            {paper.categories.map((cat, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-100 text-primary text-xs font-medium rounded"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {paper.title}
          </h2>

          {/* Authors */}
          <div className="mb-3">
            <p className="text-sm font-semibold text-gray-700 mb-1">Authors:</p>
            <p className="text-sm text-gray-600">
              {paper.authors.join(', ')}
            </p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="font-semibold text-gray-700">Published:</p>
              <p className="text-gray-600">{formatDate(paper.publishedDate)}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Source:</p>
              <p className="text-gray-600 capitalize">{paper.source}</p>
            </div>
          </div>

          {/* Abstract */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">Abstract:</p>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {paper.abstract}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
          {paper.pdfUrl && (
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 bg-gray-600 text-white text-center rounded-lg hover:bg-gray-700 transition-colors"
            >
              View PDF
            </a>
          )}
          <a
            href={paper.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 bg-primary text-white text-center rounded-lg hover:bg-blue-600 transition-colors"
          >
            View Paper
          </a>
          <button
            onClick={() => {
              onSave(paper)
              onClose()
            }}
            className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => {
              onDismiss(paper)
              onClose()
            }}
            className="flex-1 px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaperDetailModal

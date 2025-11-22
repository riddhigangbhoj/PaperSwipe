import { formatAuthors, truncateText, formatDate } from '../../utils/paperFormatter'

const PaperCard = ({ paper, onClick }) => {
  return (
    <div
      className="absolute w-full h-full bg-white rounded-2xl shadow-xl cursor-grab active:cursor-grabbing"
      onClick={onClick}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
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
        <h2 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-3">
          {paper.title}
        </h2>

        {/* Authors */}
        <p className="text-sm text-gray-600 mb-2">
          {formatAuthors(paper.authors)}
        </p>

        {/* Date */}
        <p className="text-xs text-gray-500 mb-4">
          Published: {formatDate(paper.publishedDate)}
        </p>

        {/* Abstract Preview */}
        <div className="flex-1 overflow-hidden">
          <p className="text-gray-700 leading-relaxed">
            {truncateText(paper.abstract, 300)}
          </p>
        </div>

        {/* Tap to view more hint */}
        <div className="mt-4 text-center text-sm text-gray-400">
          Tap to view details
        </div>
      </div>
    </div>
  )
}

export default PaperCard

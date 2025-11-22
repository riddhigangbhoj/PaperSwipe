import { useState } from 'react'

const FilterPanel = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dateFilter, setDateFilter] = useState('all')

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter)

    let fromDate = null
    const now = new Date()

    switch(filter) {
      case 'week':
        fromDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        fromDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case 'year':
        fromDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
      case 'all':
      default:
        fromDate = null
    }

    onFilterChange({ dateFrom: fromDate })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
        {dateFilter !== 'all' && (
          <span className="ml-1 px-2 py-0.5 bg-primary text-white text-xs rounded-full">1</span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Publication Date</h3>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="dateFilter"
                  value="all"
                  checked={dateFilter === 'all'}
                  onChange={() => handleDateFilterChange('all')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">All time</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="dateFilter"
                  value="week"
                  checked={dateFilter === 'week'}
                  onChange={() => handleDateFilterChange('week')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Last week</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="dateFilter"
                  value="month"
                  checked={dateFilter === 'month'}
                  onChange={() => handleDateFilterChange('month')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Last month</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="dateFilter"
                  value="year"
                  checked={dateFilter === 'year'}
                  onChange={() => handleDateFilterChange('year')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Last year</span>
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default FilterPanel

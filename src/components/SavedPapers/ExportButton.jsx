import { useState } from 'react'
import { useUserPreferences } from '../../context/UserPreferencesContext'

const ExportButton = ({ papers }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const { exportPapers } = useUserPreferences()

  const handleExport = async (format) => {
    if (papers.length === 0) {
      alert('No papers to export')
      return
    }

    setIsExporting(true)

    try {
      const blob = await exportPapers(format)
      const extension = format === 'bibtex' ? 'bib' : format === 'csv' ? 'csv' : 'txt'
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `saved_papers.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export error:', err)
      alert('Failed to export papers. Please try again.')
    } finally {
      setIsExporting(false)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={papers.length === 0 || isExporting}
        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
          papers.length === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-primary text-white hover:bg-blue-600'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {isExporting ? 'Exporting...' : 'Export'}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
            <button
              onClick={() => handleExport('bibtex')}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">BibTeX</p>
                <p className="text-xs text-gray-500">For citations</p>
              </div>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 border-t border-gray-100"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">CSV</p>
                <p className="text-xs text-gray-500">For spreadsheets</p>
              </div>
            </button>
            <button
              onClick={() => handleExport('text')}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 border-t border-gray-100"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">Text</p>
                <p className="text-xs text-gray-500">Plain text list</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ExportButton

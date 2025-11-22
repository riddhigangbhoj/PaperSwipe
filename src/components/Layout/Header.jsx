import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/swipe')
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/swipe" className="text-2xl font-bold text-primary">
            PaperSwipe
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              to="/swipe"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/swipe'
                  ? 'text-primary bg-blue-50'
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              Swipe
            </Link>
            <Link
              to="/saved"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/saved'
                  ? 'text-primary bg-blue-50'
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              Saved
            </Link>
            <Link
              to="/settings"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/settings'
                  ? 'text-primary bg-blue-50'
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              Settings
            </Link>

            {isAuthenticated() ? (
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/login'
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-purple-600 hover:bg-purple-50'
                }`}
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header

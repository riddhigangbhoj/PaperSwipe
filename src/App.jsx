import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PapersProvider } from './context/PapersContext'
import { UserPreferencesProvider } from './context/UserPreferencesContext'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import Header from './components/Layout/Header'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import Saved from './pages/Saved'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <UserPreferencesProvider>
            <PapersProvider>
              <div className="min-h-screen bg-gray-50">
                <Header />
                <Routes>
                  <Route path="/" element={<Onboarding />} />
                  <Route path="/swipe" element={<Home />} />
                  <Route path="/saved" element={<Saved />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Routes>
              </div>
            </PapersProvider>
          </UserPreferencesProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App

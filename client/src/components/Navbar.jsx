import { useNavigate } from 'react-router-dom'
import ThemeToggle from './UI/ThemeToggle.jsx'
import { useAuthStore } from '../Store/authStore.js'
import { authApi } from '../api/auth.api.js'

function Navbar({ boardName, isDark, onToggleTheme, onBack }) {
  const navigate            = useNavigate()
  const { user, clearAuth } = useAuthStore()

  async function handleLogout() {
    try {
      await authApi.logout()
    } catch {
    } finally {
      clearAuth()
      navigate('/login', { replace: true })
    }
  }

  // First letter of user's name for avatar
  const avatarLetter = user?.name?.charAt(0).toUpperCase() || '?'

  return (
    <nav className="
      h-14
      bg-white dark:bg-gray-800
      border-b border-gray-200 dark:border-gray-700
      flex items-center justify-between
      px-6
      transition-colors duration-200
      flex-shrink-0
    ">
      {/* Left side */}
      <div className="flex items-center gap-3">

        {/* Arrow back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="
              w-8 h-8 rounded-lg
              flex items-center justify-center
              text-gray-400 hover:text-gray-700
              dark:text-gray-500 dark:hover:text-gray-200
              hover:bg-gray-100 dark:hover:bg-gray-700
              transition-colors duration-150
            "
            aria-label="Back to boards"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16" height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
        )}

        {/* Logo */}
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">S</span>
        </div>

        <span className="font-semibold text-gray-800 dark:text-gray-100">
          SnapTrack
        </span>

        {/* Board name breadcrumb */}
        {boardName && (
          <>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="text-gray-600 dark:text-gray-400 text-sm truncate max-w-xs">
              {boardName}
            </span>
          </>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

        {/* User avatar */}
        {user && (
          <div className="
            w-8 h-8 rounded-full
            bg-blue-600
            flex items-center justify-center
            flex-shrink-0
          ">
            <span className="text-white text-xs font-semibold">
              {avatarLetter}
            </span>
          </div>
        )}

        {/* Sign out */}
        {user && (
          <button
            onClick={handleLogout}
            className="
              text-xs font-medium
              text-gray-500 dark:text-gray-400
              hover:text-red-500 dark:hover:text-red-400
              px-2.5 py-1.5 rounded-lg
              hover:bg-red-50 dark:hover:bg-red-900/20
              transition-colors duration-150
            "
          >
            Sign out
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navbar
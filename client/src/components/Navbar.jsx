import ThemeToggle from './UI/ThemeToggle.jsx'

function Navbar({ boardName, isDark, onToggleTheme, onBack }) {
  return (
    <nav className="
      h-14
      bg-white dark:bg-gray-800
      border-b border-gray-200 dark:border-gray-700
      flex items-center justify-between
      px-6
      transition-colors duration-200
    ">
      <div className="flex items-center gap-3">

        {/* Back button — only shown when onBack prop is passed */}
        {onBack && (
          <button
            onClick={onBack}
            className="
              w-8 h-8 rounded-lg
              flex items-center justify-center
              text-gray-400 hover:text-gray-600
              dark:text-gray-500 dark:hover:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700
              transition-colors duration-150
              mr-1
            "
            aria-label="Back to dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
        )}

        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">S</span>
        </div>
        <span className="font-semibold text-gray-800 dark:text-gray-100">
          SnapTrack
        </span>
        {boardName && (
          <>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="text-gray-600 dark:text-gray-400 text-sm truncate max-w-xs">
              {boardName}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <span className="text-blue-600 dark:text-blue-300 text-xs font-semibold">U</span>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
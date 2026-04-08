function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle dark mode"
      className="
        w-9 h-9 rounded-lg
        flex items-center justify-center
        bg-gray-100 hover:bg-gray-200
        dark:bg-gray-700 dark:hover:bg-gray-600
        transition-colors duration-200
      "
    >
      {isDark ? (
        // Sun icon 
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16" height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-yellow-400"
        >
          <circle cx="12" cy="12" r="4"/>
          <line x1="12" y1="2"  x2="12" y2="6"/>
          <line x1="12" y1="18" x2="12" y2="22"/>
          <line x1="4.22"  y1="4.22"  x2="7.05"  y2="7.05"/>
          <line x1="16.95" y1="16.95" x2="19.78" y2="19.78"/>
          <line x1="2"  y1="12" x2="6"  y2="12"/>
          <line x1="18" y1="12" x2="22" y2="12"/>
          <line x1="4.22"  y1="19.78" x2="7.05"  y2="16.95"/>
          <line x1="16.95" y1="7.05"  x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        // Moon icon 
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16" height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-600 dark:text-gray-300"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  )
}

export default ThemeToggle
import ThemeToggle from './UI/ThemeToggle.jsx'

function Navbar({ boardName, isDark, onToggleTheme }) {
  return (
    <nav className="
      h-14
      bg-white dark:bg-gray-800
      border-b border-gray-200 dark:border-gray-700
      flex items-center justify-between
      px-6
      transition-colors duration-200
    ">

      {/* Left — logo + board name */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">S</span>
        </div>
        <span className="font-semibold text-gray-800 dark:text-gray-100">
          SnapTrack
        </span>
        {boardName && (
          <>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              {boardName}
            </span>
          </>
        )}
      </div>

      {/* Right — theme toggle + user avatar */}
      <div className="flex items-center gap-3">
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <span className="text-blue-600 dark:text-blue-300 text-xs font-semibold">
            U
          </span>
        </div>
      </div>

    </nav>
  )
}

export default Navbar
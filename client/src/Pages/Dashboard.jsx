import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BoardCard from '../components/Boards/BoardCard.jsx'
import BoardModal from '../components/Boards/BoardModal.jsx'
import SkeletonCard from '../components/UI/SkeletonCard.jsx'
import Button from '../components/UI/Button.jsx'
import ThemeToggle from '../components/UI/ThemeToggle.jsx'

function Dashboard({ boards, isLoading, isDark, onToggleTheme, onCreate, onDelete }) {
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="
      min-h-screen
      bg-gray-100 dark:bg-gray-900
      transition-colors duration-200
    ">
      {/* Navbar */}
      <nav className="
        h-14 bg-white dark:bg-gray-800
        border-b border-gray-200 dark:border-gray-700
        flex items-center justify-between px-6
      ">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <span className="font-semibold text-gray-800 dark:text-gray-100">
            SnapTrack
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-300 text-xs font-semibold">U</span>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="p-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              My boards
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {isLoading ? '' : `${boards.length} ${boards.length === 1 ? 'board' : 'boards'}`}
            </p>
          </div>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            + New board
          </Button>
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3].map((n) => (
              <SkeletonCard key={n} type="board" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && boards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                className="text-gray-400 dark:text-gray-600">
                <rect x="3"  y="3"  width="7" height="9" rx="1"/>
                <rect x="14" y="3"  width="7" height="5" rx="1"/>
                <rect x="14" y="12" width="7" height="9" rx="1"/>
                <rect x="3"  y="16" width="7" height="5" rx="1"/>
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No boards yet</p>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Create your first board
            </Button>
          </div>
        )}

        {/* Board grid */}
        {!isLoading && boards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onOpen={() => navigate(`/board/${board.id}`)}
                onDelete={onDelete}
              />
            ))}

            {/* Ghost card */}
            <button
              onClick={() => setModalOpen(true)}
              className="
                border-2 border-dashed border-gray-200 dark:border-gray-700
                rounded-2xl p-5
                flex flex-col items-center justify-center gap-2
                min-h-[140px]
                text-gray-400 dark:text-gray-600
                hover:border-blue-300 dark:hover:border-blue-600
                hover:text-blue-400 dark:hover:text-blue-500
                transition-all duration-150 cursor-pointer
              "
            >
              <span className="text-2xl leading-none">+</span>
              <span className="text-xs font-medium">New board</span>
            </button>
          </div>
        )}
      </div>

      <BoardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={onCreate}
      />
    </div>
  )
}

export default Dashboard
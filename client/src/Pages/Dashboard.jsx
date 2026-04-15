import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BoardCard from '../components/Boards/BoardCard.jsx'
import BoardModal from '../components/Boards/BoardModal.jsx'
import SkeletonCard from '../components/UI/SkeletonCard.jsx'
import Button from '../components/UI/Button.jsx'
import Navbar from '../components/Navbar.jsx'

function Dashboard({ boards, isLoading, isDark, onToggleTheme, onCreate, onDelete, onJoinByCode, onJoinByLink }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [joinMode, setJoinMode] = useState('code')
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joining, setJoining] = useState(false)
  const navigate = useNavigate()

  async function handleJoinBoard() {
    if (!joinCode.trim()) {
      setJoinError(joinMode === 'link' ? 'Invite link is required' : 'Invite code is required')
      return
    }

    setJoining(true)
    setJoinError('')

    try {
      const boardId = joinMode === 'link'
        ? await onJoinByLink(joinCode)
        : await onJoinByCode(joinCode)

      setJoinModalOpen(false)
      setJoinCode('')
      setJoinMode('code')
      if (boardId) {
        navigate(`/board/${boardId}`)
      }
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Failed to join board')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200 flex flex-col">

      {/* Shared Navbar */}
      <Navbar isDark={isDark} onToggleTheme={onToggleTheme} />

      <div className="flex-1 p-8 overflow-y-auto">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              My boards
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {isLoading
                ? ''
                : `${boards.length} ${boards.length === 1 ? 'board' : 'boards'}`
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setJoinModalOpen(true)}>
              Join with code
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              + New board
            </Button>
          </div>
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
            <div className="
              w-16 h-16 rounded-2xl
              bg-blue-50 dark:bg-blue-900/20
              flex items-center justify-center
            ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28" height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-400"
              >
                <rect x="3"  y="3"  width="7" height="9" rx="1"/>
                <rect x="14" y="3"  width="7" height="5" rx="1"/>
                <rect x="14" y="12" width="7" height="9" rx="1"/>
                <rect x="3"  y="16" width="7" height="5" rx="1"/>
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
                No boards yet
              </h2>
              <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
                Create your first board to start tracking tasks
              </p>
            </div>
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

      {joinModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => {
            if (!joining) {
              setJoinModalOpen(false)
              setJoinError('')
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                Join board
              </h2>
              <button
                onClick={() => {
                  if (!joining) {
                    setJoinModalOpen(false)
                    setJoinError('')
                  }
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => {
                    setJoinMode('code')
                    setJoinError('')
                    setJoinCode('')
                  }}
                  className={`text-xs py-2 rounded-lg transition-colors ${
                    joinMode === 'code'
                      ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Invite code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setJoinMode('link')
                    setJoinError('')
                    setJoinCode('')
                  }}
                  className={`text-xs py-2 rounded-lg transition-colors ${
                    joinMode === 'link'
                      ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Invite link
                </button>
              </div>

              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {joinMode === 'link' ? 'Invite link' : 'Invite code'}
              </label>
              <input
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(joinMode === 'code' ? e.target.value.toUpperCase() : e.target.value)
                  setJoinError('')
                }}
                placeholder={joinMode === 'link' ? 'https://your-app/join/SNAP-XXXX' : 'SNAP-XXXX'}
                className="h-10 rounded-xl px-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {joinError && <p className="text-xs text-red-500">{joinError}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="secondary"
                onClick={() => {
                  setJoinModalOpen(false)
                  setJoinError('')
                }}
                disabled={joining}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleJoinBoard} disabled={joining}>
                {joining ? 'Joining...' : 'Join'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
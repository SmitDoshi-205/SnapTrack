import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BoardCard from '../components/Boards/BoardCard.jsx'
import BoardModal from '../components/Boards/BoardModal.jsx'
import SkeletonCard from '../components/UI/SkeletonCard.jsx'
import Button from '../components/UI/Button.jsx'
import Navbar from '../components/Navbar.jsx'

function Dashboard({
  boards,
  isLoading,
  isDark,
  onToggleTheme,
  onCreate,
  onDelete,
  onJoinByCode,
  onJoinByLink,
}) {
  const [modalOpen, setModalOpen]       = useState(false)
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [joinMode, setJoinMode]         = useState('code')
  const [joinCode, setJoinCode]         = useState('')
  const [joinError, setJoinError]       = useState('')
  const [joining, setJoining]           = useState(false)
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
      if (boardId) navigate(`/board/${boardId}`)
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Failed to join board')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
      <Navbar isDark={isDark} onToggleTheme={onToggleTheme} />

      <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
              My Boards
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {isLoading ? '' : `${boards.length} ${boards.length === 1 ? 'board' : 'boards'}`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Analytics */}
            <button
              onClick={() => navigate('/analytics')}
              className="
                flex items-center gap-1.5
                text-sm font-medium
                text-gray-500 dark:text-gray-400
                hover:text-blue-600 dark:hover:text-blue-400
                px-3 py-2 rounded-xl
                hover:bg-white dark:hover:bg-gray-700
                border border-transparent hover:border-gray-200 dark:hover:border-gray-600
                transition-all duration-150
              "
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6"  y1="20" x2="6"  y2="14"/>
              </svg>
              Analytics
            </button>

            {/* Join */}
            <Button variant="secondary" onClick={() => setJoinModalOpen(true)}>
              Join with code
            </Button>

            {/* New board */}
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              + New board
            </Button>
          </div>
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3].map((n) => <SkeletonCard key={n} type="board" />)}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && boards.length === 0 && (
          <div className="
            flex flex-col items-center justify-center
            py-28 gap-5 text-center
          ">
            <div className="
              w-20 h-20 rounded-3xl
              bg-blue-50 dark:bg-blue-900/20
              flex items-center justify-center
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                className="text-blue-400">
                <rect x="3"  y="3"  width="7" height="9" rx="1"/>
                <rect x="14" y="3"  width="7" height="5" rx="1"/>
                <rect x="14" y="12" width="7" height="9" rx="1"/>
                <rect x="3"  y="16" width="7" height="5" rx="1"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                No boards yet
              </h2>
              <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
                Create your first board and start tracking tasks with your team
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setJoinModalOpen(true)}>
                Join a board
              </Button>
              <Button variant="primary" onClick={() => setModalOpen(true)}>
                Create your first board
              </Button>
            </div>
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
                min-h-[160px]
                text-gray-400 dark:text-gray-600
                hover:border-blue-300 dark:hover:border-blue-700
                hover:text-blue-400 dark:hover:text-blue-500
                hover:bg-blue-50/50 dark:hover:bg-blue-900/10
                transition-all duration-150 cursor-pointer
              "
            >
              <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">
                <span className="text-lg leading-none mb-0.5">+</span>
              </div>
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

      {/* Join modal */}
      {joinModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => { if (!joining) { setJoinModalOpen(false); setJoinError('') } }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                Join a board
              </h2>
              <button
                onClick={() => { if (!joining) { setJoinModalOpen(false); setJoinError('') } }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Mode toggle */}
              <div className="grid grid-cols-2 bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
                {['code', 'link'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { setJoinMode(mode); setJoinError(''); setJoinCode('') }}
                    className={`
                      text-xs py-2 rounded-lg capitalize transition-colors
                      ${joinMode === mode
                        ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                      }
                    `}
                  >
                    Invite {mode}
                  </button>
                ))}
              </div>

              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {joinMode === 'link' ? 'Paste invite link' : 'Enter invite code'}
              </label>
              <input
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(joinMode === 'code' ? e.target.value.toUpperCase() : e.target.value)
                  setJoinError('')
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleJoinBoard() }}
                placeholder={joinMode === 'link' ? 'https://…/join/SNAP-XXXX' : 'SNAP-XXXX'}
                className="
                  h-10 rounded-xl px-3
                  border border-gray-200 dark:border-gray-600
                  bg-white dark:bg-gray-700
                  text-gray-700 dark:text-gray-100
                  text-sm
                  outline-none focus:ring-2 focus:ring-blue-500
                  transition-all
                "
              />
            </div>

            {joinError && <p className="text-xs text-red-500">{joinError}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={() => { setJoinModalOpen(false); setJoinError('') }} disabled={joining}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleJoinBoard} disabled={joining}>
                {joining ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                    Joining...
                  </span>
                ) : 'Join board'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
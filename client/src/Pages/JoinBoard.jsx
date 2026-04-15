import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { boardApi } from '../api/board.api.js'
import { useAuthStore } from '../Store/authStore.js'

function JoinBoard() {
  const { code }    = useParams()
  const navigate    = useNavigate()
  const { user }    = useAuthStore()

  const [status, setStatus]   = useState('joining') // joining | success | error | already
  const [message, setMessage] = useState('')
  const [boardId, setBoardId] = useState(null)

  useEffect(() => {
    // If not logged in — redirect to login
    if (!user) {
      navigate('/login', {
        state: { from: `/join/${code}` },
        replace: true,
      })
      return
    }

    async function joinBoard() {
      try {
        const { data } = await boardApi.join(code)
        setBoardId(data.data.boardId)
        setStatus('success')

        // Auto-redirect to the board 
        setTimeout(() => {
          navigate(`/board/${data.data.boardId}`, { replace: true })
        }, 1500)
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to join board'

        if (err.response?.status === 409) {
          // Already a member 
          setStatus('already')
          setTimeout(() => navigate('/', { replace: true }), 1500)
        } else {
          setStatus('error')
          setMessage(msg)
        }
      }
    }

    joinBoard()
  }, [user, code])

  return (
    <div className="
      min-h-screen bg-gray-100 dark:bg-gray-900
      flex items-center justify-center p-4
    ">
      <div className="
        bg-white dark:bg-gray-800
        rounded-2xl shadow-sm
        border border-gray-200 dark:border-gray-700
        w-full max-w-sm p-8
        text-center
      ">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">S</span>
          </div>
          <span className="font-semibold text-gray-800 dark:text-gray-100">
            SnapTrack
          </span>
        </div>

        {/* Joining state */}
        {status === 'joining' && (
          <>
            <div className="
              w-12 h-12 rounded-full
              border-2 border-blue-600 border-t-transparent
              animate-spin mx-auto mb-4
            "/>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
              Joining board...
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Using invite code <span className="font-mono font-semibold">{code}</span>
            </p>
          </>
        )}

        {/* Success state */}
        {status === 'success' && (
          <>
            <div className="
              w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30
              flex items-center justify-center mx-auto mb-4
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="text-green-600 dark:text-green-400">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
              You're in!
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting you to the board...
            </p>
          </>
        )}

        {/* Already a member */}
        {status === 'already' && (
          <>
            <div className="
              w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30
              flex items-center justify-center mx-auto mb-4
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="text-blue-600 dark:text-blue-400">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
              Already a member
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Taking you to your boards...
            </p>
          </>
        )}

        {/* Error state */}
        {status === 'error' && (
          <>
            <div className="
              w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30
              flex items-center justify-center mx-auto mb-4
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="text-red-600 dark:text-red-400">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
              Invalid invite code
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {message || 'This invite link is invalid or has expired'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Go to dashboard
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default JoinBoard
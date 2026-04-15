import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../Store/authStore.js'

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuthStore()
  const location            = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}

export default ProtectedRoute
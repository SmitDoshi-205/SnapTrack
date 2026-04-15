import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './Pages/Dashboard.jsx'
import BoardView from './Pages/BoardView.jsx'
import Login from './Pages/Login.jsx'
import Register from './Pages/Register.jsx'
import JoinBoard from './Pages/JoinBoard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { getInitialTheme, applyTheme } from './Store/themeStore.js'
import { loadBoards, saveBoards } from './Store/boardStore.js'
import { useAuthStore } from './Store/authStore.js'
import { authApi } from './api/auth.api.js'

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function makeDefaultColumns() {
  return [
    { id: `col-todo-${generateId()}`,       title: 'To Do',       tasks: [] },
    { id: `col-inprogress-${generateId()}`, title: 'In Progress', tasks: [] },
    { id: `col-done-${generateId()}`,       title: 'Done',        tasks: [] },
  ]
}

function App() {
  // ── Theme ──────────────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(getInitialTheme)
  useEffect(() => { applyTheme(isDark) }, [isDark])
  function handleToggleTheme() { setIsDark((prev) => !prev) }

  // ── Auth ───────────────────────────────────────────────────────────────────
  const { user, setAuth, clearAuth, setLoading } = useAuthStore()

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('accessToken')
      if (!token) { setLoading(false); return }
      try {
        const { data } = await authApi.me()
        setAuth(data.data.user, token)
      } catch {
        clearAuth()
      }
    }
    checkAuth()
  }, [])

  // ── Boards — load per user ─────────────────────────────────────────────────
  const [boards, setBoards]       = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Reload boards whenever the logged-in user changes
  useEffect(() => {
    if (!user) return
    const t = setTimeout(() => {
      const saved = loadBoards(user.id)
      setBoards(saved || [])
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(t)
  }, [user?.id])

  // Save boards when they change
  useEffect(() => {
    if (!isLoading && user) saveBoards(boards, user.id)
  }, [boards, isLoading, user])

  function handleCreateBoard({ name, description }) {
    const newBoard = {
      id:          `board-${generateId()}`,
      name,
      description,
      columns:     makeDefaultColumns(),
    }
    setBoards((prev) => [...prev, newBoard])
  }

  function handleDeleteBoard(boardId) {
    setBoards((prev) => prev.filter((b) => b.id !== boardId))
  }

  function handleUpdateBoard(boardId, updatedColumns) {
    setBoards((prev) =>
      prev.map((b) => b.id === boardId ? { ...b, columns: updatedColumns } : b)
    )
  }

  return (
    <Routes>
      <Route path="/login"      element={<Login />} />
      <Route path="/register"   element={<Register />} />
      <Route path="/join/:code" element={<JoinBoard />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard
              boards={boards}
              isLoading={isLoading}
              isDark={isDark}
              onToggleTheme={handleToggleTheme}
              onCreate={handleCreateBoard}
              onDelete={handleDeleteBoard}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/board/:boardId"
        element={
          <ProtectedRoute>
            <BoardView
              boards={boards}
              isDark={isDark}
              onToggleTheme={handleToggleTheme}
              onUpdateBoard={handleUpdateBoard}
              onDeleteBoard={handleDeleteBoard}
            />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
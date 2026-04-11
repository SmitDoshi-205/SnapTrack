import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './Pages/Dashboard.jsx'
import BoardView from './Pages/BoardView.jsx'
import { getInitialTheme, applyTheme } from './Store/themeStore.js'
import { loadBoards, saveBoards } from './Store/boardStore.js'

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

const SEED_BOARDS = [
  {
    id: 'board-1',
    name: 'My First Board',
    description: 'Getting started with SnapTrack',
    columns: [
      {
        id: 'todo',
        title: 'To Do',
        tasks: [
          { id: '1', title: 'Design the login page',  description: 'Create wireframes and finalise the colour palette', priority: 'High',   tags: ['UI', 'Design'],   dueDate: '2025-04-01' },
          { id: '2', title: 'Set up Prisma schema',   description: 'Define User, Board, Column, Task models',          priority: 'High',   tags: ['Backend', 'DB'],  dueDate: '2025-04-10' },
          { id: '3', title: 'Write README',           description: null,                                               priority: 'Low',    tags: ['Docs'],           dueDate: null },
        ],
      },
      {
        id: 'inprogress',
        title: 'In Progress',
        tasks: [
          { id: '4', title: 'Build Navbar component', description: 'Responsive navbar with logo, board name, user avatar', priority: 'Medium', tags: ['UI'], dueDate: '2025-04-05' },
        ],
      },
      {
        id: 'done',
        title: 'Done',
        tasks: [
          { id: '5', title: 'Initialise Vite project', description: 'Set up React + Tailwind + folder structure', priority: 'Low', tags: ['Setup'], dueDate: null },
        ],
      },
    ],
  },
]

function App() {
  // Theme — lives here because both pages need it
  const [isDark, setIsDark] = useState(getInitialTheme)
  useEffect(() => { applyTheme(isDark) }, [isDark])
  function handleToggleTheme() { setIsDark((prev) => !prev) }

  // Boards — lives here so both pages share the same data
  const [boards, setBoards]     = useState(() => loadBoards() || SEED_BOARDS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!isLoading) saveBoards(boards)
  }, [boards, isLoading])

  function handleCreateBoard({ name, description }) {
    const newBoard = {
      id:      `board-${generateId()}`,
      name,
      description,
      columns: makeDefaultColumns(),
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
      <Route
        path="/"
        element={
          <Dashboard
            boards={boards}
            isLoading={isLoading}
            isDark={isDark}
            onToggleTheme={handleToggleTheme}
            onCreate={handleCreateBoard}
            onDelete={handleDeleteBoard}
          />
        }
      />
      <Route
        path="/board/:boardId"
        element={
          <BoardView
            boards={boards}
            isDark={isDark}
            onToggleTheme={handleToggleTheme}
            onUpdateBoard={handleUpdateBoard}
            onDeleteBoard={handleDeleteBoard}
          />
        }
      />
      {/* Catch-all — unknown URLs go to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
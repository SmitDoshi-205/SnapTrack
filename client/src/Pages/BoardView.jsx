import { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import InviteCodeDisplay from '../components/Boards/InviteCodeDisplay.jsx'
import Navbar from '../components/Navbar.jsx'
import Column from '../components/Kanban/Column.jsx'
import TaskCard from '../components/Kanban/TaskCard.jsx'
import TaskModal from '../components/Kanban/TaskModal.jsx'
import SkeletonCard from '../components/UI/SkeletonCard.jsx'
import MemberAvatar from '../components/UI/MemberAvatar.jsx'
import { useAuthStore } from '../Store/authStore.js'

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 }

function sortByPriority(tasks) {
  return [...tasks].sort(
    (a, b) =>
      (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1)
  )
}

function sortAllColumns(columns) {
  return columns.map((col) => ({ ...col, tasks: sortByPriority(col.tasks) }))
}

function BoardView({
  boards,
  isLoading,
  isDark,
  onToggleTheme,
  onUpdateBoard,
  onDeleteBoard,
  onLeaveBoard,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
}) {
  const { boardId }             = useParams()
  const navigate                = useNavigate()
  const { user: currentUser }   = useAuthStore()

  const board = boards.find((b) => b.id === boardId)

  // Is current user the owner of this board?
  const isOwner = board?.members?.some(
    (m) => (m.userId || m.user?.id) === currentUser?.id && m.role === 'owner'
  )

  const [modalOpen, setModalOpen]   = useState(false)
  const [activeTask, setActiveTask] = useState(null)
  const [activeColId, setActiveColId] = useState(null)
  const [draggingTask, setDraggingTask] = useState(null)
  const [isLeaving, setIsLeaving]   = useState(false)

  const moveSeqByTaskRef = useRef({})

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function updateColumns(updater) {
    if (!board) return
    const updated = sortAllColumns(updater(board.columns))
    onUpdateBoard(boardId, updated)
  }

  //  Modal handlers 
  function handleAddTask(columnId) {
    setActiveTask(null)
    setActiveColId(columnId)
    setModalOpen(true)
  }

  function handleTaskClick(task, columnId) {
    setActiveTask(task)
    setActiveColId(columnId)
    setModalOpen(true)
  }

  function handleCloseModal() {
    setModalOpen(false)
    setActiveTask(null)
    setActiveColId(null)
  }

  //  Task CRUD 
  async function handleAddNewTask(columnId, newTask) {
    await onCreateTask(boardId, columnId, newTask)
  }

  async function handleEditTask(updatedTask) {
    await onUpdateTask(boardId, updatedTask.id, updatedTask)
  }

  async function handleDeleteTask(taskId) {
    await onDeleteTask(boardId, taskId)
  }

  //  Leave board 
  async function handleLeaveBoard() {
    if (!window.confirm('Leave this board? You will need a new invite to rejoin.')) return
    setIsLeaving(true)
    try {
      await onLeaveBoard(boardId)
      navigate('/')
    } catch {
      setIsLeaving(false)
    }
  }

  //  Drag and drop 
  function handleDragStart(event) {
    const task = board?.columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === event.active.id)
    setDraggingTask(task || null)
  }

  function handleDragEnd(event) {
    setDraggingTask(null)
    const { active, over } = event
    if (!over || !board) return

    const taskId   = active.id
    const columns  = board.columns

    const fromColumn = columns.find((col) =>
      col.tasks.some((t) => t.id === taskId)
    )
    if (!fromColumn) return

    const isOverColumn = columns.some((col) => col.id === over.id)
    const toColumn = isOverColumn
      ? columns.find((col) => col.id === over.id)
      : columns.find((col) => col.tasks.some((t) => t.id === over.id))

    if (!toColumn || fromColumn.id === toColumn.id) return

    const task = fromColumn.tasks.find((t) => t.id === taskId)
    if (!task) return

    const previousColumns = board.columns
    const moveSeq = (moveSeqByTaskRef.current[taskId] || 0) + 1
    moveSeqByTaskRef.current[taskId] = moveSeq

    updateColumns((cols) =>
      cols.map((col) => {
        if (col.id === fromColumn.id)
          return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
        if (col.id === toColumn.id)
          return { ...col, tasks: [...col.tasks, { ...task, columnId: toColumn.id }] }
        return col
      })
    )

    const position = toColumn.tasks.length * 1000
    onMoveTask(boardId, taskId, { columnId: toColumn.id, position }).catch(() => {
      if (moveSeqByTaskRef.current[taskId] === moveSeq) {
        onUpdateBoard(boardId, previousColumns)
      }
    })
  }

  //  Loading 
  if (isLoading) {
    return (
      <div className="h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
        <Navbar isDark={isDark} onToggleTheme={onToggleTheme} />
        <main className="p-6 flex gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 w-80 flex-shrink-0">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4 animate-pulse" />
              <div className="flex flex-col gap-3">
                {[1, 2].map((i) => <SkeletonCard key={i} type="task" />)}
              </div>
            </div>
          ))}
        </main>
      </div>
    )
  }

  //  Board not found 
  if (!board) {
    return (
      <div className="h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center gap-3">
        <p className="text-gray-500 dark:text-gray-400">Board not found</p>
        <button onClick={() => navigate('/')} className="text-sm text-blue-500 hover:underline">
          ← Back to boards
        </button>
      </div>
    )
  }

  //  Main render 
  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200 flex flex-col overflow-hidden">
      <Navbar
        boardName={board.name}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        onBack={() => navigate('/')}
      />

      {/* Subbar — members + invite + actions */}
      <div className="
        bg-white dark:bg-gray-800
        border-b border-gray-200 dark:border-gray-700
        px-6 py-2
        flex items-center justify-between
        flex-shrink-0
      ">
        {/* Left — member avatars */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 dark:text-gray-500">Members</span>
          <div className="flex items-center">
            {(board.members || []).map((member, index) => (
              <div
                key={member.userId || member.user?.id}
                style={{ marginLeft: index > 0 ? '-8px' : '0', zIndex: index }}
                className="relative"
              >
                <MemberAvatar user={member.user} size="sm" role={member.role} />
              </div>
            ))}
          </div>
        </div>

        {/* Right — invite + analytics + leave */}
        <div className="flex items-center gap-3">
          {board.inviteCode && (
            <InviteCodeDisplay inviteCode={board.inviteCode} />
          )}

          <button
            onClick={() => navigate(`/board/${boardId}/analytics`)}
            className="
              flex items-center gap-1.5 text-xs font-medium
              text-gray-500 dark:text-gray-400
              hover:text-blue-600 dark:hover:text-blue-400
              transition-colors duration-150
            "
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6"  y1="20" x2="6"  y2="14"/>
            </svg>
            Analytics
          </button>

          {/* Leave board — only visible to non-owners */}
          {!isOwner && (
            <button
              onClick={handleLeaveBoard}
              disabled={isLeaving}
              className="
                flex items-center gap-1.5 text-xs font-medium
                text-gray-500 dark:text-gray-400
                hover:text-red-500 dark:hover:text-red-400
                transition-colors duration-150
                disabled:opacity-50
              "
            >
              {isLeaving ? (
                <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"/>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              )}
              {isLeaving ? 'Leaving...' : 'Leave board'}
            </button>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <main className="flex-1 p-6 overflow-x-auto">
          <div className="flex gap-5 min-w-max pb-4">
            {board.columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                onAddTask={() => handleAddTask(column.id)}
                onTaskClick={(task) => handleTaskClick(task, column.id)}
              />
            ))}
          </div>
        </main>

        <DragOverlay>
          {draggingTask ? (
            <div className="rotate-2 opacity-95">
              <TaskCard task={draggingTask} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onAdd={handleAddNewTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        task={activeTask}
        columnId={activeColId}
        boardMembers={board?.members || []}
      />
    </div>
  )
}

export default BoardView
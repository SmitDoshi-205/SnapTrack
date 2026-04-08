import { useState, useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import Column from './components/Kanban/Column.jsx'
import TaskModal from './components/Kanban/TaskModal.jsx'
import { saveBoard, loadBoard } from './Store/boardStore.js'

const DEFAULT_COLUMNS = [
  {
    id: 'todo',
    title: 'To Do',
    tasks: [
      {
        id: '1',
        title: 'Design the login page',
        description: 'Create wireframes and finalise the colour palette',
        priority: 'High',
        tags: ['UI', 'Design'],
        dueDate: '2025-04-01',
      },
      {
        id: '2',
        title: 'Set up Prisma schema',
        description: 'Define User, Board, Column, Task models',
        priority: 'High',
        tags: ['Backend', 'DB'],
        dueDate: '2025-04-10',
      },
      {
        id: '3',
        title: 'Write README',
        description: null,
        priority: 'Low',
        tags: ['Docs'],
        dueDate: null,
      },
    ],
  },
  {
    id: 'inprogress',
    title: 'In Progress',
    tasks: [
      {
        id: '4',
        title: 'Build Navbar component',
        description: 'Responsive navbar with logo, board name, user avatar',
        priority: 'Medium',
        tags: ['UI'],
        dueDate: '2025-04-05',
      },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      {
        id: '5',
        title: 'Initialise Vite project',
        description: 'Set up React + Tailwind + folder structure',
        priority: 'Low',
        tags: ['Setup'],
        dueDate: null,
      },
    ],
  },
]

function App() {
  // Load from localStorage on first render
  const [columns, setColumns] = useState(() => loadBoard() || DEFAULT_COLUMNS)

  // Modal state 
  const [modalOpen, setModalOpen]   = useState(false)
  const [activeTask, setActiveTask] = useState(null)    
  const [activeColId, setActiveColId] = useState(null)

  // Persist to localStorage every time columns changes
  useEffect(() => {
    saveBoard(columns)
  }, [columns])

  // Open modal in CREATE mode
  function handleAddTask(columnId) {
    setActiveTask(null)
    setActiveColId(columnId)
    setModalOpen(true)
  }

  // Open modal in EDIT mode
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

  // Add a new task to the correct column
  function handleAddNewTask(columnId, newTask) {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col
      )
    )
  }

  // Replace an existing task with updated data
  function handleEditTask(updatedTask) {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === activeColId
          ? {
              ...col,
              tasks: col.tasks.map((t) =>
                t.id === updatedTask.id ? updatedTask : t
              ),
            }
          : col
      )
    )
  }

  // Remove a task from its column
  function handleDeleteTask(taskId, columnId) {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
          : col
      )
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">

      <Navbar boardName="My First Board" />

      <main className="p-6 overflow-x-auto">
        <div className="flex gap-5 min-w-max">
          {columns.map((column) => (
            <Column
              key={column.id}
              title={column.title}
              tasks={column.tasks}
              onAddTask={() => handleAddTask(column.id)}
              onTaskClick={(task) => handleTaskClick(task, column.id)}
            />
          ))}
        </div>
      </main>

      <TaskModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onAdd={handleAddNewTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        task={activeTask}
        columnId={activeColId}
      />

    </div>
  )
}

export default App
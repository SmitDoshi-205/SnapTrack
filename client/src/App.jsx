import Navbar from './components/Navbar.jsx'
import Column from './components/Kanban/Column.jsx'

const INITIAL_COLUMNS = [
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
  const handleAddTask = (columnId) => {
    console.log('Add task to column:', columnId)
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar boardName="React App" />

      <main className="p-6 overflow-x-auto">
        <div className="flex gap-5 min-w-max">
          {INITIAL_COLUMNS.map((column) => (
            <Column
              key={column.id}
              title={column.title}
              tasks={column.tasks}
              onAddTask={() => handleAddTask(column.id)}
            />
          ))}
        </div>
      </main>

    </div>
  )
}

export default App